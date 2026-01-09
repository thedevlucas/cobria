// Dependencies
import xlsx from "xlsx";
import axios from "axios";
// Error
import { httpError } from "../../../config/CustomError";
// Twillio
import {
  TWILIO_WHATSAPP_TEMPLATES,
  twillioClient,
} from "../../../config/Twillio";
// Models
import { User } from "../../../models/User";
import { Debtor } from "../../../models/Debtor";
import { Cellphone } from "../../../models/Cellphone";
import { Telephone } from "../../../models/Telephone";
// Interfaces
import { createDebtorInterface } from "../../../schemas/DebtorSchema";
// Helpers
import {
  deleteBlankSpaces,
  capitalizeWords,
  removeAccents,
} from "../../FormatString";
import { getText4Image } from "./OCRHelper";
import { identifyPaymentImage, checkImageMessage } from "./GPTHelper";
// Other services
import { createChat } from "../../../services/chat/ChatService";
// Constants
import {
  account_sid,
  auth_token_twilio,
  gptPromptsJson,
  backend_host,
  twilio_whatsapp_number,
} from "../../../config/Constants";
import {
  PaymentStatus,
  Status,
} from "../../../Contexts/BillingPlatform/debtor/domain/Debtor";

// Send first message to users
export async function sendFirstMessageToClient(
  idUser: number,
  clientPhoneNumber: string,
  clientName: string
) {
  try {
    // Send message
    await twillioClient.messages.create({
      contentSid: TWILIO_WHATSAPP_TEMPLATES.GREETINGS_MESSAGE,
      contentVariables: JSON.stringify({ 2: clientName }),
      from: `whatsapp:${twilio_whatsapp_number}`,
      to: `whatsapp:${
        clientPhoneNumber === "+593949261653"
          ? "+51949261653"
          : clientPhoneNumber
      }`,
    });
    // Create the chat in the db
    await createChat({
      id_user: idUser,
      from_cellphone: Number(twilio_whatsapp_number),
      to_cellphone: Number(clientPhoneNumber),
      message: `¡Buen día! ¿Le puedo ayudar con algo? Le hablo para verificar si ${clientName} se encuentra disponible.`,
    });
  } catch (error) {
    console.log(error);

    await createChat({
      id_user: idUser,
      from_cellphone: Number(twilio_whatsapp_number),
      to_cellphone: Number(clientPhoneNumber),
      message: "Error al enviar el mensaje",
      status: false,
    });
  }
  return { message: "Mensaje enviado" };
}

// Send message to the chat
export async function sendWhatsappMessage(
  from: string,
  to: string,
  message: string,
  idUser: number
) {
  try {
    // Send message
    await twillioClient.messages.create({
      body: message,
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
    });
    // Create the chat in the db
    await createChat({
      id_user: idUser,
      from_cellphone: Number(from),
      to_cellphone: Number(to),
      message: message,
    });
  } catch (error) {
    console.log(error);

    await createChat({
      id_user: idUser,
      from_cellphone: Number(from),
      to_cellphone: Number(to),
      message: "Error al enviar el mensaje",
      status: false,
    });
  }
  return { message: "Mensaje enviado" };
}

export function deletePrefixWhatsapp(cellphone: string) {
  return cellphone.replace("whatsapp:", "");
}

// Lowercase and eliminate accents
function lowerCaseColumns(
  excelJson: Array<Record<string, any>>
): Array<Record<string, any>> {
  return excelJson.map((row: Record<string, any>) => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
      newRow[deleteBlankSpaces(removeAccents(key.toLowerCase()))] = row[key];
    }
    return newRow;
  });
}

export function excel2Json(
  workbook: xlsx.WorkBook
): Array<Record<string, any>> {
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData: Array<Record<string, any>> = xlsx.utils.sheet_to_json(sheet);
  // Lowercase the columns of the json file
  return lowerCaseColumns(jsonData);
}

export async function getUserVerifyNumber(idUser: number) {
  const user = await User.findOne({ where: { id: idUser } });
  if (!user) {
    throw new httpError("No se encontró el usuario", 404);
  }
  return user;
}

export async function createDebtor4Csv(
  createDebtorInterface: createDebtorInterface,
  idUser: number
) {
  createDebtorInterface.name = capitalizeWords(
    deleteBlankSpaces(createDebtorInterface.name)
  );
  const searchDebtor = await Debtor.findOne({
    where: { document: createDebtorInterface.document, id_user: idUser },
  });
  if (!searchDebtor) {
    const debtor = await Debtor.create({
      ...createDebtorInterface,
      id_user: idUser,
      paid: PaymentStatus.NO_CONTACT,
      status: Status.CHARGED_OFF,
    });
    return debtor;
  }
  return searchDebtor;
}

export async function createCellphone4Csv(
  debtorId: number,
  from: number,
  to: number
) {

  const clientNumber = to; 
  console.log("Creando celular para deudor:", debtorId, clientNumber);

  const searchCellphone = await Cellphone.findOne({
    where: { 
        number: clientNumber,
        id_debtor: debtorId 
    },
  });
  
  if (!searchCellphone) {
    await Cellphone.create({ 
        number: clientNumber,
        from: from, 
        to: to,   
        id_debtor: debtorId 
    });
  }
}

export async function createTelephone4Csv(
  debtorId: number,
  from: number,
  to: number
) {
  console.log(debtorId, from, to);

  const searchTelephone = await Telephone.findOne({
    where: { from: from, to: to, id_debtor: debtorId },
  });
  if (!searchTelephone) {
    await Telephone.create({ from, to, id_debtor: debtorId });
  }
}


export async function verifyCellphoneDebtor(from: number, to: number) {

  let cellphoneRelatedToDebtor = await Cellphone.findOne({
    where: { number: from },
    include: [{
        model: Debtor,
        as: "debtor" 
    }]
  });

  if (!cellphoneRelatedToDebtor) {
      cellphoneRelatedToDebtor = await Cellphone.findOne({
        where: { number: to },
        include: [{
            model: Debtor,
            as: "debtor"
        }]
      });
  }


  if (!cellphoneRelatedToDebtor) {
      cellphoneRelatedToDebtor = await Cellphone.findOne({
        where: { from: from, to: to },
        include: [{
            model: Debtor,
            as: "debtor" 
        }]
      });
  }

  if (!cellphoneRelatedToDebtor) {
    console.log("Teléfono no encontrado en BD, buscando deudor huérfano...");
    return null; 
  }

  return cellphoneRelatedToDebtor;
}

export async function verifyTelephoneDebtor(from: number, to: number) {
  const telephoneRelatedToDebtor = await Telephone.findOne({
    where: { from, to },
    include: [{
        model: Debtor,
        as: "debtor"
    }]
  });
  if (!telephoneRelatedToDebtor) {
    throw new httpError("No se encontró el teléfono", 404);
  }
  return telephoneRelatedToDebtor;
}

export async function image2Buffer(urlImage: string) {
  const response = await axios.get(urlImage, {
    auth: {
      username: account_sid as string,
      password: auth_token_twilio as string,
    },
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

export async function confirmDebtImage(
  image: string,
  from: number,
  to: number,
  debtor: any
) {
  const ocrText = await getText4Image(image);
  const gptText = await identifyPaymentImage(ocrText, from, to);
  const gptTextNew = removeAccents(gptText.toLowerCase());
  await checkImageMessage(gptTextNew, debtor, image);
}

export async function getPromptMessage(debtor: any) {
  if (debtor.paid == "Paid") {
    return gptPromptsJson.prompt_finished_chat;
  } else if (debtor.paid == "Added") {
    return gptPromptsJson.prompt_abono_debt;
  }
  return gptPromptsJson.prompt_response;
}

export function formatBotResponse(botResponse: string): {
  userResponse: string;
  actionRecord: string;
} {
  return JSON.parse(botResponse.replace(/```json|```/g, "").trim());
}