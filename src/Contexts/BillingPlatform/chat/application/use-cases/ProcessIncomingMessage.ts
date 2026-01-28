import { twilio_whatsapp_number, excelColumns } from "../../../../../config/Constants";
import {
  getContextMessages,
} from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { arrayBuffer2Base64 } from "../../../../../helpers/chat/whatsapp/OCRHelper";
import {
  confirmDebtImage,
  image2Buffer,
} from "../../../../../helpers/chat/whatsapp/WhatsAppHelper";
import { Debtor } from "../../../../../models/Debtor";
import { Cost } from "../../../../../models/Cost"; 
import { Chat as ChatModel } from "../../../../../models/Chat"; // Modelo de Mongoose para queries directas
import { CostRepository } from "../../../cost/domain/CostRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";
import { ProcessImageMessage } from "../services/ProcessImageMessage";
import { SendWhatsappMessage } from "../services/SendWhatsappMessage";

import { AIService, CollectionContext } from "../../../../../services/ai/LLAMAService";

function extractDebtAmountFromContext(messages: any[]): number {
  const columnsConfig = JSON.parse(excelColumns());
  const debtAlternatives = columnsConfig.required_alternatives["saldo int. mora legal"] || [];
  
  for (const msg of messages) {
    const content = msg.message || msg.content || msg.text || '';
    
    const match = content.match(/\[AI_CONTEXT_INTERNAL\](.*?)\[\/AI_CONTEXT_INTERNAL\]/);
    if (match && match[1]) {
      try {
        const contextData = JSON.parse(match[1]);
        
        for (const key of Object.keys(contextData)) {
          const lowerKey = key.toLowerCase();
          if (debtAlternatives.some((alt: string) => lowerKey.includes(alt.toLowerCase()))) {
            const amount = parseFloat(String(contextData[key]).replace(/[^0-9.-]/g, ''));
            if (!isNaN(amount) && amount > 0) {
              console.log(`💰 Monto de deuda extraído: ${amount} desde columna "${key}"`);
              return amount;
            }
          }
        }
        
        for (const [key, value] of Object.entries(contextData)) {
          if (typeof value === 'number' && value > 0) {
            console.log(`💰 Monto de deuda (fallback): ${value} desde columna "${key}"`);
            return value;
          }
          if (typeof value === 'string') {
            const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (!isNaN(numValue) && numValue > 100) { 
              console.log(`💰 Monto de deuda (fallback string): ${numValue} desde columna "${key}"`);
              return numValue;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing AI context:", e);
      }
    }
  }
  
  return 0;
}

function extractDebtorInfoFromContext(messages: any[]): Record<string, any> | null {
  for (const msg of messages) {
    const content = msg.message || msg.content || msg.text || '';
    const match = content.match(/\[AI_CONTEXT_INTERNAL\](.*?)\[\/AI_CONTEXT_INTERNAL\]/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.error("Error parsing debtor info:", e);
      }
    }
  }
  return null;
}

export class ProcessIncomingMessage {
  private readonly sendWhatsappMessageService: SendWhatsappMessage;
  private readonly aiService: AIService;

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

    this.aiService = new AIService(process.env.GEMINI_API_KEY || "");
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
  Number(fromNumber),
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
    } catch (error) {
      console.error("❌ Error al registrar el costo:", error);
    }

    if (params.media.message_type === "image") {
      const imageToBuffer = await image2Buffer(params.media.image);
      const chat = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(toNumber),
        toCellphone: Number(fromNumber),
        message: params.message,
        image: imageToBuffer,
        imageType: params.media.image_type,
      });
      await this.chatRepository.save(chat);
    } else {

      const chat = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(toNumber),
        toCellphone: Number(fromNumber),
        message: params.message,
      });
      await this.chatRepository.save(chat);
    }

    const rawChats = await ChatModel.find({
      $or: [
        { id_user: debtor.id_user, to_cellphone: Number(toNumber) },
        { id_user: debtor.id_user, from_cellphone: Number(toNumber) },
      ],
    }).sort({ createdAt: 1 });
    const debtAmount = extractDebtAmountFromContext(rawChats);
    const debtorInfo = extractDebtorInfoFromContext(rawChats);
    
    console.log(`💰 Monto de deuda encontrado para ${debtor.name}: $${debtAmount}`);
    if (debtorInfo) {
      console.log(`📋 Información del deudor del Excel:`, JSON.stringify(debtorInfo).substring(0, 200));
    }

    const dbHistory = await getContextMessages(
      debtor.id_user,
      Number(toNumber),
      "whatsapp"
    );

    const formattedHistory = dbHistory.map((msg: any) => ({
        message: msg.content || msg.text || msg.message,
        is_from_debtor: msg.role === 'user',
        timestamp: msg.createdAt || new Date().toISOString()
    })).reverse();

    formattedHistory.push({
        message: params.message,
        is_from_debtor: true,
        timestamp: new Date().toISOString()
    });

    const aiContext: CollectionContext = {
      debtor_name: debtor.name,
      debtor_document: String(debtor.document),
      payment_status: debtor.status || debtor.paid || "Pending",
      debt_amount: debtAmount, 
      days_overdue: 30,
      collection_channel: 'whatsapp',
      previous_interactions: formattedHistory,
      debtor_profile: {
        payment_history: "Standard",
        communication_preference: "Whatsapp"
      },
      collection_stage: "Cobranza"
    };

    // --- 4. GENERACIÓN DE RESPUESTA ---
    let aiResponse;
    try {
      console.log(`🧠 IA Procesando mensaje: "${params.message}"`);
      aiResponse = await this.aiService.generateCollectionMessage(aiContext);
    } catch (error) {
      console.error("⚠️ Error en IA, usando fallback", error);
      aiResponse = { 
        suggested_message: "Lo siento, en este momento no puedo procesar tu solicitud. Un asesor te contactará.",
        next_action: "Error del sistema"
      };
    }

    const messageToSend = aiResponse.suggested_message;

    // --- 5. ENVÍO Y GUARDADO (SOLUCIÓN "MENSAJES DUPLICADOS") ---

    // Enviamos a WhatsApp
    await this.sendWhatsappMessageService.run({
      fromNumber: fromNumber,
      toNumber: toNumber,
      message: messageToSend,
      idUser: debtor.id_user,
    });

    const chatBot = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(fromNumber),
        toCellphone: Number(toNumber),
        message: messageToSend, 
    });
 
    if (aiResponse.next_action) {
         if (debtor.events && debtor.events.length > 4000) debtor.events = debtor.events.substring(0, 4000); 
         debtor.addEvent(`[IA] ${aiResponse.next_action}`);
         await this.debtorRepository.save(debtor);
    }

    return { message: "Procesado correctamente" };
  }

  private removeWhatsappPrefix(number: string): string {
    const prefix = "whatsapp:+";
    return number.startsWith(prefix) ? number.replace(prefix, "") : number;
  }
}
