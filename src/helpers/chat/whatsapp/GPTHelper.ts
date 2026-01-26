// Dependencies
import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
  Content,
  GenerateContentResult,
} from "@google/generative-ai";
// Constants
import {
  bard_api_key,
  gptPromptsJson,
  ocrConfig,
  twilio_whatsapp_number,
} from "../../../config/Constants";
const genAI = new GoogleGenerativeAI(bard_api_key || "");
// Helpers
import { getMora } from "./PaymentHelper";
import { updatePaidStatus } from "../../DebtorHelper";
// Other services
import { getChats } from "../../../services/chat/ChatService";
import { getCallChat } from "../../../services/chat/CallChatService";
import { createDebtImage } from "../../../services/chat/DebtorImageService";

export const model: GenerativeModel = genAI.getGenerativeModel({
  model: gptPromptsJson["gpt_model"],
});

// Simple string interpolation function
function interpolateString(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

export function sendDebtMessage(
  jsonInfo: Record<string, any>,
  prompt: string,
  agentName?: string
) {
  const message: string = interpolateString(prompt, {
    debtorName: jsonInfo[ocrConfig["name"]] || jsonInfo.nombre || jsonInfo.name || "Cliente",
    agentName: agentName || "Administradora",
  });
  return message;
}

export async function getContextMessages(
  idUser: number,
  debtorCellphone: number,
  typeChat: string = "whatsapp"
) {
  const chats =
    typeChat == "whatsapp"
      ? await getChats(idUser, debtorCellphone, true)
      : await getCallChat(idUser, debtorCellphone, true);

  const contextMessages: Array<Record<string, any>> = [gptPromptsJson["laws"]];
  
  // Collect admin feedback instructions to add as priority context
  const adminFeedbackInstructions: string[] = [];

  for (const chat of chats) {
    if (chat.message && chat.message.trim() !== "") {
      let messageText = chat.message;
      
      // Extract AI context data if present (for AI to use)
      if (messageText.includes('[AI_CONTEXT_INTERNAL]')) {
        // Extract the JSON from the internal marker
        const match = messageText.match(/\[AI_CONTEXT_INTERNAL\](.*?)\[\/AI_CONTEXT_INTERNAL\]/);
        if (match && match[1]) {
          // Add the JSON context as a model message for AI understanding
          contextMessages.push({
            role: "model",
            parts: [{ text: `${match[1]}\n${gptPromptsJson.initial_json.parts[0].text}` }],
          });
        }
        continue; // Don't add the raw internal message
      }
      
      // Extract admin feedback for AI instructions
      if (messageText.includes('[ADMIN_FEEDBACK]')) {
        const feedbackMatch = messageText.match(/\[ADMIN_FEEDBACK\](.*?)\[\/ADMIN_FEEDBACK\]/);
        if (feedbackMatch && feedbackMatch[1]) {
          try {
            const feedbackData = JSON.parse(feedbackMatch[1]);
            if (feedbackData.instruction) {
              adminFeedbackInstructions.push(feedbackData.instruction);
            }
          } catch (e) {
            // If JSON parse fails, use the raw text
            adminFeedbackInstructions.push(feedbackMatch[1]);
          }
        }
        continue; // Don't add admin feedback as regular message
      }
      
      contextMessages.push({
        role: chat.from_cellphone === twilio_whatsapp_number ? "model" : "user",
        parts: [{ text: messageText }],
      });
    }
  }

  // Add admin feedback as priority instructions if any exist
  if (adminFeedbackInstructions.length > 0) {
    contextMessages.push({
      role: "user",
      parts: [{ 
        text: `INSTRUCCIONES PRIORITARIAS DEL ADMINISTRADOR (DEBES SEGUIR ESTAS INSTRUCCIONES):\n${adminFeedbackInstructions.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nEstas instrucciones tienen prioridad sobre las reglas generales.` 
      }],
    });
  }

  if (typeChat != "whatsapp") {
    contextMessages.push(gptPromptsJson["phone_laws"]);
  }

  return contextMessages;
}

export async function sendContextMessage(
  historyMessages: Record<string, any>[],
  userMessage: string = gptPromptsJson["prompt_response"]
) {
  const chat: ChatSession = model.startChat({
    history: historyMessages as Content[],
  });
  try {
    const result: GenerateContentResult = await chat.sendMessage(userMessage);
    const responseText = result.response.text();
    return responseText;
  } catch (error) {
    console.error(error);
    const error_response = {
      userResponse:
        "Desafortunadamente, el servicio ha sido un error. Póngase en contacto más tarde. Haremos nuestro mejor esfuerzo para contactarlo lo antes posible.",
      actionRecord: null,
      status: "Error",
    };

    return JSON.stringify(error_response);
  }
}

// Image helpers (OCR)

export async function identifyPaymentImage(
  ocrText: string,
  from: number,
  to: number
) {
  // Getting the mora of the user
  const moraUser = await getMora(from, to);
  // Replacing in text
  const copyDebtOcr = JSON.parse(JSON.stringify(gptPromptsJson["debt_ocr"]));
  copyDebtOcr.parts[0].text = interpolateString(copyDebtOcr.parts[0].text, {
    mora: moraUser,
  });
  const messages = [copyDebtOcr];
  const chat = model.startChat({
    history: messages,
  });
  const result = await chat.sendMessage(ocrText);
  const response = await result.response;
  return response.text();
}

export async function checkImageMessage(
  gptTextNew: string,
  debtor: any,
  image: string
) {
  const debtImageJson = {
    id_debtor: debtor.id,
    image: image,
    type: "",
  };
  if (
    gptPromptsJson["responses_checkers_ocr"]["response_paid"].some(
      (confirmationWord: string) => gptTextNew.includes(confirmationWord)
    )
  ) {
    debtImageJson.type = "Paid";
    await createDebtImage(debtImageJson);
    await updatePaidStatus(debtor, "Paid");
  } else if (
    gptPromptsJson["responses_checkers_ocr"]["response_added"].some(
      (confirmationWord: string) => gptTextNew.includes(confirmationWord)
    )
  ) {
    debtImageJson.type = "Added";
    await createDebtImage(debtImageJson);
    await updatePaidStatus(debtor, "Added");
  }
  return "";
}
