import { twilio_whatsapp_number } from "../../../../../config/Constants";
import {
  getContextMessages,
  sendContextMessage,
} from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { arrayBuffer2Base64 } from "../../../../../helpers/chat/whatsapp/OCRHelper";
import { getPaymentMessage } from "../../../../../helpers/chat/whatsapp/PaymentHelper";
import {
  confirmDebtImage,
  getPromptMessage,
  image2Buffer,
} from "../../../../../helpers/chat/whatsapp/WhatsAppHelper";
import { Debtor } from "../../../../../models/Debtor";
import { Cost } from "../../../../../models/Cost"; 
import { CostRepository } from "../../../cost/domain/CostRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";
import { ProcessImageMessage } from "../services/ProcessImageMessage";
import { SendWhatsappMessage } from "../services/SendWhatsappMessage";

export class ProcessIncomingMessage {
  private readonly sendWhatsappMessageService: SendWhatsappMessage;

  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly chatRepository: ChatRepository,
    private readonly processImageMessageService: ProcessImageMessage,
    private readonly communicationService: Communication,
    private readonly costRepository: CostRepository
  ) {
    this.sendWhatsappMessageService = new SendWhatsappMessage(
      chatRepository,
      this.communicationService,
      this.costRepository
    );
  }

  async run(params: {
    serviceNumber: string;
    debtorNumber: string;
    message: string;
    media: Record<string, string>;
  }) {
    console.log(
      `Arrived a message from ${params.debtorNumber} to ${params.serviceNumber}`
    );

    if (!params.serviceNumber || !params.debtorNumber) {
      return;
    }

    const fromNumber = this.removeWhatsappPrefix(params.serviceNumber); 
    const toNumber = this.removeWhatsappPrefix(params.debtorNumber);

    const debtor = await this.debtorRepository.findByCellphone(
      Number(toNumber),
      Number(toNumber)
    );

    if (!debtor) {
      console.warn(`Deudor no encontrado para el número ${toNumber}`);
      return;
    }
    try {
      await Cost.create({
        id_user: debtor.id_user,
        id_company: debtor.id_user,
        id_debtor: debtor.id, 
        type: 'whatsapp',
        cost_type: 'message',
        amount: 0.05,
        description: `Mensaje entrante de ${toNumber}`,
        phone_number: Number(toNumber),
        status: 'processed'
      });
      console.log(`💰 Cobro registrado exitosamente para el usuario ${debtor.id_user}`);
    } catch (error) {
      console.error("❌ Error al registrar el costo del mensaje:", error);
    }

    if (params.media.message_type === "image") {
      const imageToBuffer = await image2Buffer(params.media.image);
      const imageToBase64 = `data:${
        params.media.image_type
      };base64,${arrayBuffer2Base64(imageToBuffer)}`;

      const chat = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(toNumber),
        toCellphone: Number(fromNumber),
        message: params.message,
        image: imageToBuffer,
        imageType: params.media.image_type,
      });

      await this.chatRepository.save(chat);

      const legacyDebtor = await Debtor.findByPk(debtor.id);

      await confirmDebtImage(
        imageToBase64,
        Number(toNumber),
        Number(fromNumber),
        legacyDebtor
      );
    } else {
      const chat = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(toNumber),
        toCellphone: Number(fromNumber),
        message: params.message,
      });

      await this.chatRepository.save(chat);
    }

    const userMessagesHistory = await getContextMessages(
      debtor.id_user,
      Number(toNumber),
      "whatsapp"
    );

    const promptMessage = await getPromptMessage(debtor);

    const botResponse = await sendContextMessage(
      userMessagesHistory,
      promptMessage
    );

    const botResponseFormatted = this.formatBotResponse(
      botResponse,
      debtor.name
    );

    debtor.addEvent(botResponseFormatted.actionRecord);

    debtor.updateStatus(botResponseFormatted.status as PaymentStatus);

    const paymentMessage = await getPaymentMessage(
      Number(fromNumber),
      Number(toNumber),
      userMessagesHistory,
      debtor
    );

    const whatsappResponse =
      paymentMessage || botResponseFormatted.userResponse;

    await this.sendWhatsappMessageService.run({
      fromNumber: fromNumber,
      toNumber: toNumber,
      message: whatsappResponse,
      idUser: debtor.id_user,
    });

    const chatBot = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(fromNumber),
        toCellphone: Number(toNumber),
        message: whatsappResponse, 
    });
    await this.chatRepository.save(chatBot);

    if (botResponseFormatted.actionRecord && botResponseFormatted.actionRecord !== "null") {
         if (debtor.events && debtor.events.length > 5000) debtor.events = ""; 
         debtor.addEvent(botResponseFormatted.actionRecord);
    }
    
    debtor.updateStatus(botResponseFormatted.status as PaymentStatus);
    await this.debtorRepository.save(debtor);

    return { message: "Mensaje enviado" };
  }

  private removeWhatsappPrefix(number: string): string {
    const prefix = "whatsapp:+";

    return number.startsWith(prefix) ? number.replace(prefix, "") : number;
  }

  private formatBotResponse(botResponse: string, debtorName: string) {
    try {
      console.log("🤖 Respuesta Cruda de IA:", botResponse); // Para depurar

      // 1. Buscamos dónde empieza el primer '{' y dónde termina el último '}'
      const firstBrace = botResponse.indexOf('{');
      const lastBrace = botResponse.lastIndexOf('}');

      if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found");

      const cleanJsonString = botResponse.substring(firstBrace, lastBrace + 1);

      const parsed = JSON.parse(cleanJsonString);

      return {
        userResponse: parsed.userResponse || "Ocurrió un error, intenta de nuevo.",
        actionRecord: parsed.actionRecord || null,
        status: parsed.status || "Contact"
      };

    } catch (e) {
      console.warn("⚠️ No se pudo extraer JSON. Usando respuesta como texto plano.");
      
      const cleanText = botResponse.replace(/```json/g, "").replace(/```/g, "").trim();

      return {
        userResponse: cleanText, 
        actionRecord: null,        
        status: "Contact",         
      };
    }
  }
}