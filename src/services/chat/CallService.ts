// Config
import { twillioClient } from "../../config/Twillio";
// Constants
import { gptPromptsJson, backend_host } from "../../config/Constants";
// Helpers
import {
  getContextMessages,
  sendContextMessage,
} from "../../helpers/chat/whatsapp/GPTHelper";
import { getPaymentMessage } from "../../helpers/chat/whatsapp/PaymentHelper";
import { searchDebtorWithCellphones } from "../../helpers/DebtorHelper";
// Custom error
import { httpError } from "../../config/CustomError";
// Other services
import { createCallChat } from "./CallChatService";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse";
import {
  formatBotResponse,
  verifyTelephoneDebtor,
} from "../../helpers/chat/whatsapp/WhatsAppHelper";
import { Debtor } from "../../models/Debtor";

export async function sendCall(
  from: string,
  to: string,
  message: string,
  idUser: number
) {
  try {
    // Voice settings
    const language = gptPromptsJson.language;
    // Send message
    const response = await twillioClient.calls.create({
      from: from,
      to: to,
      twiml: `<Response>
                        <Gather input="speech" language="${language}" actionOnEmptyResult="true" action="${backend_host}/api/call/incoming">
                            <Say language="${language}">${message}</Say>
                        </Gather>
                    </Response>
            `,
    });

    // Create the chat in the db
    await createCallChat({
      id_user: idUser,
      from_cellphone: Number(from),
      to_cellphone: Number(to),
      message: message,
    });
  } catch (error) {
    await createCallChat({
      id_user: idUser,
      from_cellphone: Number(from),
      to_cellphone: Number(to),
      message: "Error al enviar el mensaje",
      status: false,
    });
  }
  return { message: "Mensaje enviado" };
}

export async function answerCallMessage(
  from: string,
  to: string,
  message: string
) {
  // Voice settings
  const language = gptPromptsJson.language;
  // Send message
  const twiml = new VoiceResponse();
  // Input type
  twiml.say({ language: language }, message);
  twiml.gather({
    input: ["speech"],
    language: language,
    action: `${backend_host}/api/call/incoming`,
    actionOnEmptyResult: true,
  });
  const debtorTelephone = await verifyTelephoneDebtor(Number(from), Number(to));
  const debtorFinded = await Debtor.findOne({
    where: { id: debtorTelephone.id_debtor },
  });

  if (!debtorFinded) {
    return;
  }

  // Create the chat in the db
  await createCallChat({
    id_user: debtorFinded.id_user,
    from_cellphone: Number(from),
    to_cellphone: Number(to),
    message: message,
  });
  return twiml.toString();
}

export async function sendRecievedMessageCall(
  from: string,
  to: string,
  message: string
) {
  try {
    console.table({ from, to, message });
    const newTo = to.replace("+", "");
    const debtorTelephone = await verifyTelephoneDebtor(
      Number(from),
      Number(newTo)
    );
    const debtor = await Debtor.findOne({
      where: { id: debtorTelephone.id_debtor },
    });

    if (!debtor) {
      return;
    }
    await createCallChat({
      id_user: debtor.id_user,
      from_cellphone: Number(to),
      to_cellphone: Number(from),
      message: message,
    });
    // Get the context messages
    const historyMessages = await getContextMessages(
      debtor.id_user,
      Number(from),
      "call"
    );
    // Generate the regular bot message
    const botMessage = await sendContextMessage(historyMessages);

    const botResponseFormatted = formatBotResponse(botMessage);

    // If there is any message about payment, then create it
    const paymentMessage = await getPaymentMessage(
      Number(to),
      Number(from),
      historyMessages,
      debtor,
      "call"
    );
    // Send the call message
    const callMessage = paymentMessage || botResponseFormatted.userResponse;
    const response = await answerCallMessage(from, newTo, callMessage);
    return response;
  } catch (error: any) {
    sendCallErrorMessage(from, to, error.message);
    throw new httpError(error.message, 400);
  }
}

export async function sendCallErrorMessage(
  from: string,
  to: string,
  message: string
) {
  const debtorTelephone = await verifyTelephoneDebtor(Number(from), Number(to));
  const debtorFinded = await Debtor.findOne({
    where: { id: debtorTelephone.id_debtor },
  });

  if (!debtorFinded) {
    return;
  }

  await createCallChat({
    id_user: debtorFinded.id_user,
    from_cellphone: Number(from),
    to_cellphone: Number(to),
    message: "Error: " + message,
    status: false,
  });
  return { message: "Mensaje enviado" };
}
