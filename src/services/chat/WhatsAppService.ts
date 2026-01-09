// Dependencies
const MessagingResponse = require("twilio").twiml.MessagingResponse;
import xlsx from "xlsx";
// Helpers
import {
  sendWhatsappMessage,
  excel2Json,
  getUserVerifyNumber,
  createDebtor4Csv,
  createCellphone4Csv,
  createTelephone4Csv,
  deletePrefixWhatsapp,
  verifyCellphoneDebtor,
  image2Buffer,
  confirmDebtImage,
  getPromptMessage,
  sendFirstMessageToClient,
} from "../../helpers/chat/whatsapp/WhatsAppHelper";
import { getPaymentMessage } from "../../helpers/chat/whatsapp/PaymentHelper";
import { arrayBuffer2Base64 } from "../../helpers/chat/whatsapp/OCRHelper";
import {
  sendDebtMessage,
  sendContextMessage,
  getContextMessages,
} from "../../helpers/chat/whatsapp/GPTHelper";
import { searchDebtorWithCellphones } from "../../helpers/DebtorHelper";
// Models
import { User } from "../../models/User";
// Custom error
import { httpError } from "../../config/CustomError";
// Other services
import { createCallChat } from "./CallChatService";
import { createChat } from "./ChatService";
import { sendCall } from "./CallService";
// Constants
import {
  gptPromptsJson,
  cellphoneInfo,
  excelColumns,
  twilio_whatsapp_number,
} from "../../config/Constants";
import { Debtor } from "../../models/Debtor";

async function sendStartingMessageFromCsv(
  telephones: Array<string | number>,
  row: Record<string, any>,
  user: any
) {
  const rowString = JSON.stringify(row);

  const from_cellphone = twilio_whatsapp_number;

  for (const telephone of telephones) {
    const stringTelephoneVerify = telephone.toString();
    if (
      telephone &&
      (stringTelephoneVerify.length == cellphoneInfo.cellphone_length ||
        stringTelephoneVerify.length == cellphoneInfo.telephone_length)
    ) {
      // Create the debtor or search it
      const debtor = await createDebtor4Csv(
        { name: row.nombre, document: row.cedula, email: user.email },
        user.id
      );
      // String for the telephone and message (Json for context)
      let stringTelephone = cellphoneInfo.country_code + stringTelephoneVerify;

      // TODO: Remove when tests all finished
      if (stringTelephone === "+593949261653") stringTelephone = "+51949261653";
      if (stringTelephone === "+593992756732") stringTelephone = "+51992756732";

      const numberTelephone = Number(stringTelephone);
      const jsonContextMessage =
        rowString + gptPromptsJson.initial_json.parts[0].text;
      // Message to send
      const message = sendDebtMessage(row, gptPromptsJson.prompt_greeting);

      // If it is a telephone
      if (
        stringTelephoneVerify.length == cellphoneInfo.telephone_length ||
        stringTelephoneVerify === "992756732"
      ) {
        // Create the telephone or search it
        await createTelephone4Csv(
          debtor.id,
          Number(from_cellphone),
          numberTelephone
        );

        await sendCall(from_cellphone!, stringTelephone, message, user.id);
        // Save chat
        await createCallChat({
          id_user: user.id,
          from_cellphone: Number(from_cellphone),
          to_cellphone: numberTelephone,
          message: jsonContextMessage,
        });
      } else {
        // If it is a cellphone
        // Create the cellphone or search it
        await createCellphone4Csv(
          debtor.id,
          Number(from_cellphone),
          numberTelephone
        );
        // Send whatsapp message
        await sendFirstMessageToClient(user.id, stringTelephone, row.nombre);
        // Save chat
        await createChat({
          id_user: user.id,
          from_cellphone: Number(twilio_whatsapp_number),
          to_cellphone: numberTelephone,
          message: jsonContextMessage,
        });
      }
    }
  }
}

export async function sendMessagesFromCsv(
  workbook: xlsx.WorkBook,
  idUser: number
) {
  // Get the user
  const user = await getUserVerifyNumber(idUser);

  // Return the json from the excel file
  const excelJson: Array<Record<string, any>> = excel2Json(workbook);
  const columns = JSON.parse(excelColumns());
  // Check columns of the excel file
  let telephoneKeysNames: Array<string> = Object.keys(excelJson[0]).filter(
    (e) => e.indexOf(columns.telephone) >= 0
  );
  if (telephoneKeysNames.length === 0) {
    throw new httpError(
      "No se encontraron columnas de teléfonos en el archivo.",
      400
    );
  }
  const requiredColumns: Boolean = columns.required.every((e: string) =>
    Object.keys(excelJson[0]).includes(e)
  );
  if (!requiredColumns) {
    throw new httpError(
      `No se encontraron todas las columnas requeridas en el archivo. Las columnas requeridas son: ${columns.required.join(
        ", "
      )}`,
      400
    );
  }
  // Send the message to each telephone
  for (const row of excelJson) {
    // Get the values of telephone numbers
    const telephones = telephoneKeysNames.map((e) => row[e]);
    // Send the message to each telephone number
    await sendStartingMessageFromCsv(telephones, row, user);
  }
  return { message: "Mensajes enviados" };
}

export async function sendMessageChat(
  userId: number,
  to: number,
  message: string
) {
  if (!message) {
    throw new httpError("No se envió ningún mensaje", 400);
  }
  const user = await User.findOne({ where: { id: userId } });
  await sendWhatsappMessage(twilio_whatsapp_number!, "+" + to, message, userId);
  return { message: "Mensaje enviado" };
}

export async function sendRecievedMessageChat(
  from: string,
  to: string,
  message: string,
  media: Record<string, any>
) {
  let idUser: number;

  try {
    console.table({
      from,
      to,
      message,
      media: JSON.stringify(media),
    });
    const newFrom = deletePrefixWhatsapp(from); // this will be the number of the debtor
    const newTo = deletePrefixWhatsapp(to);
    const cellphone = await verifyCellphoneDebtor(
      Number(newFrom),
      Number(newTo)
    );
    const debtorFinded = await Debtor.findOne({
      where: { id: cellphone.id_debtor },
    });

    if (!debtorFinded) {
      console.error("Not sent the received message. Can't debtor!!");
      return;
    }

    idUser = debtorFinded.id_user;
    // Search the debtor
    // If there is an image in our chat
    if (media.message_type === "image") {
      const debtor = await searchDebtorWithCellphones(
        Number(newTo),
        Number(newFrom)
      );
      // Image to buffer
      const imageBuffer = await image2Buffer(media.image);
      // Create chat
      await createChat({
        id_user: idUser,
        from_cellphone: Number(newFrom),
        to_cellphone: Number(newTo),
        message: message,
        image: imageBuffer,
        image_type: media.image_type,
      });
      // Buffer to base 64
      const imageBase64 = `data:${media.image_type};base64,${arrayBuffer2Base64(
        imageBuffer
      )}`;
      // Check if the image is a debt image
      await confirmDebtImage(
        imageBase64,
        Number(newTo),
        Number(newFrom),
        debtor
      );
    } else {
      await createChat({
        id_user: idUser,
        from_cellphone: Number(newFrom),
        to_cellphone: Number(newTo),
        message: message,
      });
    }
    const debtor = await searchDebtorWithCellphones(
      Number(newFrom),
      Number(newTo)
    );

    // debtor.addEvent(DebtorChatEvents.USER_RESPONSE_RECEIVED);

    //await debtorRepository.save(debtor);

    // Get the messages from the context of the chat
    const historyMessages = await getContextMessages(
      idUser,
      Number(newFrom),
      "whatsapp"
    );

    // Generate the regular bot message
    const promptMessage = await getPromptMessage(debtor);

    const botMessage: string = await sendContextMessage(
      historyMessages,
      promptMessage
    );

    console.log(JSON.parse(botMessage.replace(/```json|```/g, "").trim()));

    // If there is any message about payment, then create it
    const paymentMessage = await getPaymentMessage(
      Number(newTo),
      Number(newFrom),
      historyMessages,
      debtor
    );
    // Send the wahtsapp message
    const whatsappMessage: string = (
      paymentMessage ? paymentMessage : botMessage
    )?.replace("[Nombre del deudor]", debtor?.name);
    await sendWhatsappMessage(newTo, newFrom, whatsappMessage, idUser);
    return { message: "Mensaje enviado" };
  } catch (error: any) {
    console.log(error);
    await sendErrorMessage(to, from, "failed", error.message);
    throw new httpError(error.message, 400);
  }
}

export async function sendErrorMessage(
  from: string,
  to: string,
  status: string,
  message: string
) {
  if (status == "failed") {
    const newFrom = deletePrefixWhatsapp(from);
    const newTo = deletePrefixWhatsapp(to);

    const user = await User.findOne({ where: { cellphone: newFrom } });

    if (!user) {
      throw Error(
        "404: No se encontró el usuario durante el envío de un mensaje de error"
      );
    }

    await createChat({
      id_user: user.id,
      from_cellphone: Number(newFrom),
      to_cellphone: Number(newTo),
      message: "Error: " + message,
      status: false,
    });
  }
  return { message: "Mensaje enviado" };
}

// Export sendWhatsappMessage for use in other files
export { sendWhatsappMessage };