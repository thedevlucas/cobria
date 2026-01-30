import { Chat as ChatModel } from "../../../../../models/Chat";
import { getContextMessages } from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { ProcessImageMessage } from "../services/ProcessImageMessage";
import { Chat } from "../../domain/Chat";
import { SendWhatsappMessage } from "../services/SendWhatsappMessage";
import { AIService, CollectionContext } from "../../../../../services/ai/AIService";

export class ProcessIncomingMessage {
  private readonly sendWhatsappMessageService: SendWhatsappMessage;
  private readonly aiService: AIService;

  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly chatRepository: ChatRepository,
    private readonly processImageMessageService: ProcessImageMessage, // 3ero
    private readonly communicationService: Communication,        // 4to
    private readonly costRepository: CostRepository               // 5to
  ) {
    // Inicializamos el servicio de envío con los repositorios correctos
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

    // 1. Guardar mensaje entrante
    const incomingChat = Chat.create({
      idUser: debtor.id_user,
      fromCellphone: Number(toNumber),
      toCellphone: Number(fromNumber),
      message: params.message,
    });
    await this.chatRepository.save(incomingChat);

    // 2. RECUPERAR HISTORIAL Y EXTRAER FEEDBACKS [ADMIN_FEEDBACK]
    const rawChats = await ChatModel.find({
      $or: [
        { id_user: debtor.id_user, to_cellphone: Number(toNumber) },
        { id_user: debtor.id_user, from_cellphone: Number(toNumber) },
      ],
    }).sort({ createdAt: 1 });

    const adminFeedbackInstructions: string[] = [];
    rawChats.forEach((c: any) => {
      if (c.message && c.message.includes('[ADMIN_FEEDBACK]')) {
        const match = c.message.match(/\[ADMIN_FEEDBACK\](.*?)\[\/ADMIN_FEEDBACK\]/);
        if (match && match[1]) adminFeedbackInstructions.push(match[1]);
      }
    });

    // 3. Generar respuesta automática con "Memoria de Feedback"
    const dbHistory = await getContextMessages(debtor.id_user, Number(toNumber), "whatsapp");
    const formattedHistory = dbHistory.map((msg: any) => ({
        message: msg.content || msg.text || msg.message,
        is_from_debtor: msg.role === 'user',
        timestamp: new Date().toISOString()
    })).reverse();

    const aiContext: CollectionContext = {
      debtor_name: debtor.name,
      debtor_document: String(debtor.document),
      payment_status: debtor.status || "Pending",
      debt_amount: 0,
      days_overdue: 30,
      collection_channel: 'whatsapp',
      previous_interactions: formattedHistory,
      admin_feedback: adminFeedbackInstructions, // La IA recibe tus correcciones aquí
      debtor_profile: { payment_history: "Standard", communication_preference: "Whatsapp" },
      collection_stage: "Cobranza"
    };

    const aiResponse = await this.aiService.generateCollectionMessage(aiContext);

    // 4. Enviar respuesta automática corregida
    await this.sendWhatsappMessageService.run({
      fromNumber,
      toNumber,
      message: aiResponse.suggested_message,
      idUser: debtor.id_user,
    });

    return { message: "Procesado correctamente" };
  }
}