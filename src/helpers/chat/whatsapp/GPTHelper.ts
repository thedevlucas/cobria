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

  for (const chat of chats) {
    if (chat.message && chat.message.trim() !== "") {
      contextMessages.push({
        role: chat.from_cellphone === twilio_whatsapp_number ? "model" : "user",
        parts: [{ text: chat.message }],
      });
    }
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
