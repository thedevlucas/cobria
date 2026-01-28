import { twilio_whatsapp_number } from "../../../../../config/Constants";
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
import { CostRepository } from "../../../cost/domain/CostRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";
import { ProcessImageMessage } from "../services/ProcessImageMessage";
import { SendWhatsappMessage } from "../services/SendWhatsappMessage";

// IMPORTAMOS EL SERVICIO DE IA
import { AIService, CollectionContext } from "../../../../../services/ai/LLAMAService";

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
    // Asegúrate de tener tu API KEY aquí o en variables de entorno
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
      Number(toNumber),
      Number(toNumber)
    );

    if (!debtor) {
      console.warn(`Deudor no encontrado para el número ${toNumber}`);
      return;
    }

    // --- 1. REGISTRO DE COSTOS ---
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

    // --- 2. MANEJO DE IMÁGENES O TEXTO ---
    if (params.media.message_type === "image") {
      // Lógica de imágenes intacta...
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
      // Nota: Si es imagen, podrías querer detener el flujo aquí o dejar que la IA responda algo genérico.
      // Por ahora dejamos que continúe.
    } else {
      // Guardamos el mensaje del usuario en BD
      const chat = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(toNumber),
        toCellphone: Number(fromNumber),
        message: params.message,
      });
      await this.chatRepository.save(chat);
    }

    // --- 3. PREPARACIÓN DE IA (SOLUCIÓN "MEMORIA CORTA") ---
    
    // Obtenemos historial previo
    const dbHistory = await getContextMessages(
      debtor.id_user,
      Number(toNumber),
      "whatsapp"
    );

    // Mapeamos y aseguramos orden cronológico
    const formattedHistory = dbHistory.map((msg: any) => ({
        message: msg.content || msg.text || msg.message,
        is_from_debtor: msg.role === 'user',
        timestamp: msg.createdAt || new Date().toISOString()
    })).reverse(); // Asumiendo que getContextMessages los trae del más nuevo al más viejo

    // IMPORTANTE: Agregamos manualmente el mensaje actual al historial que ve la IA.
    // Esto asegura que la IA sepa qué acaba de escribir el usuario, incluso si la BD es lenta.
    formattedHistory.push({
        message: params.message,
        is_from_debtor: true,
        timestamp: new Date().toISOString()
    });

    const aiContext: CollectionContext = {
      debtor_name: debtor.name,
      debtor_document: String(debtor.document), // Corrección de tipo: number -> string
      payment_status: debtor.status,
      debt_amount: 0, // TODO: Reemplazar con llamada real a tu repositorio de Facturas/Deudas
      days_overdue: 30,
      collection_channel: 'whatsapp',
      previous_interactions: formattedHistory, // Usamos el historial con el mensaje inyectado
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

    // Creamos el objeto Chat para el bot
    const chatBot = Chat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(fromNumber),
        toCellphone: Number(toNumber),
        message: messageToSend, 
    });

    // CORRECCIÓN DUPLICADOS:
    // Si tus mensajes se duplicaban en la web, es porque `sendWhatsappMessageService` YA guarda el mensaje.
    // Comentamos este save manual. Si notas que ahora NO aparecen, descoméntalo.
    
    // await this.chatRepository.save(chatBot); <--- COMENTADO PARA EVITAR DUPLICADOS

    // Actualizamos info del deudor basada en la IA
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