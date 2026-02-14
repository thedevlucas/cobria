import { Chat as ChatModel } from "../../../../../models/Chat";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { ProcessImageMessage } from "../services/ProcessImageMessage";
import { Chat } from "../../domain/Chat";
import { SendWhatsappMessage } from "../services/SendWhatsappMessage";
import { AIService, CollectionContext } from "../../../../../services/ai/AIService";
import { createDebtImage } from "../../../../../services/chat/DebtorImageService"; // Importar el servicio existente

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
      communicationService,
      costRepository
    );
    this.aiService = new AIService(process.env.GEMINI_API_KEY || "");
  }

  async run(params: { serviceNumber: string; debtorNumber: string; message: string; media: Record<string, string>; }) {
    const fromNumber = params.serviceNumber.replace("whatsapp:+", ""); 
    const toNumber = params.debtorNumber.replace("whatsapp:+", "");

    const debtor = await this.debtorRepository.findByCellphone(Number(fromNumber), Number(toNumber));
    if (!debtor) return;

    // --- 1. DETECTAR SI ES IMAGEN O TEXTO Y GUARDAR ---
    let internalContext = "";

    // Verificamos si params.media tiene contenido (Postman/Twilio envían MediaUrl0, etc.)
    const hasImage = params.media && (params.media.image || params.media.MediaUrl0);
    
    if (hasImage) {
       const imageUrl = params.media.image || params.media.MediaUrl0;
       
       // 1. Guardamos la imagen en la base de datos como Pendiente de validar
       await createDebtImage({
           id_debtor: debtor.id,
           image: imageUrl,
           type: 'Pending' // <--- Se guarda como pendiente
       });

       // 2. Guardamos el mensaje en el chat para el historial
       const imageChat = Chat.create({
          idUser: debtor.id_user,
          fromCellphone: Number(toNumber),
          toCellphone: Number(fromNumber),
          message: imageUrl, 
       });
       await this.chatRepository.save(imageChat);

       internalContext = "[SISTEMA: El usuario envió un comprobante. Se ha guardado como 'PENDIENTE' para validación del administrador. Informa al usuario que el equipo revisará el pago manualmente.]";
    } else {
       // Guardado normal de texto
       const incomingChat = Chat.create({
          idUser: debtor.id_user,
          fromCellphone: Number(toNumber),
          toCellphone: Number(fromNumber),
          message: params.message,
       });
       await this.chatRepository.save(incomingChat);
    }

    // --- 2. RECUPERAR HISTORIAL LIMPIO ---
    // Usamos ChatModel directo para evitar filtros ocultos del helper viejo
    const rawChats = await ChatModel.find({
      $or: [
        { id_user: debtor.id_user, to_cellphone: Number(toNumber) },
        { id_user: debtor.id_user, from_cellphone: Number(toNumber) },
      ],
    }).sort({ createdAt: 1 });

    const adminFeedbackInstructions: string[] = [];
    
    // Mapeamos y limpiamos el historial
    const formattedHistory = rawChats
      .filter((msg: any) => {
        const text = msg.message || "";
        // Filtros de basura técnica
        if (text.includes('[AI_CONTEXT_INTERNAL]')) return false;
        if (text.includes('[ADMIN_FEEDBACK]')) return false; 
        if (text.startsWith('{') && text.includes('gpt_model')) return false; 
        return true;
      })
      .map((msg: any) => {
        // Extraer instrucciones del admin si existen
        if (msg.message && msg.message.includes('[ADMIN_FEEDBACK]')) {
          const match = msg.message.match(/\[ADMIN_FEEDBACK\](.*?)\[\/ADMIN_FEEDBACK\]/);
          if (match && match[1]) adminFeedbackInstructions.push(match[1]);
        }

        return {
          message: msg.message || "",
          is_from_debtor: msg.from_cellphone === Number(toNumber),
          timestamp: msg.createdAt ? new Date(msg.createdAt).toISOString() : new Date().toISOString()
        };
      });

    // --- 3. INYECTAR CONTEXTO DE IMAGEN (SI APLICA) ---
    // Si acabamos de recibir una imagen, añadimos el aviso del sistema al final del historial
    // para que la IA lo lea "ahora mismo".
    if (internalContext) {
        formattedHistory.push({
            message: internalContext,
            is_from_debtor: true, // Lo hacemos pasar como input del deudor/sistema
            timestamp: new Date().toISOString()
        });
    } else {
        // Validación de seguridad para texto normal:
        // Asegurar que el último mensaje en la memoria es el que acabamos de recibir
        const lastMsg = formattedHistory[formattedHistory.length - 1];
        if (!lastMsg || lastMsg.message !== params.message) {
           formattedHistory.push({
               message: params.message,
               is_from_debtor: true,
               timestamp: new Date().toISOString()
           });
        }
    }

    // --- 4. PREPARAR CONTEXTO IA ---
    const aiContext: CollectionContext = {
      debtor_name: debtor.name,
      debtor_document: String(debtor.document),
      payment_status: debtor.status || "Pending",
      debt_amount: 0, // Ajustar si tienes el monto real en debtor
      days_overdue: 30,
      collection_channel: 'whatsapp',
      previous_interactions: formattedHistory,
      admin_feedback: adminFeedbackInstructions,
      debtor_profile: { payment_history: "Standard", communication_preference: "Whatsapp" },
      collection_stage: "Cobranza"
    };

    // --- 5. GENERAR Y ENVIAR RESPUESTA ---
    const aiResponse = await this.aiService.generateCollectionMessage(aiContext);

    await this.sendWhatsappMessageService.run({
      fromNumber,
      toNumber,
      message: aiResponse.suggested_message,
      idUser: debtor.id_user,
    });

    return { message: "Procesado correctamente" };
  }
}