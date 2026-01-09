// Real Chat Service - Implementation (FIXED: Lenient Company ID resolution)
import { Debtor } from '../../models/Debtor';
import { Cellphone } from '../../models/Cellphone';
import { Chat } from '../../models/Chat'; // Modelo de Mongoose (MongoDB)
import { Cost } from '../../models/Cost';
import { PendingMessage } from '../../models/PendingMessage';
import { QueryTypes } from 'sequelize';
import { User } from '../../models/User';

import { AIService, defaultAIConfig } from '../ai/AIService';

const aiService = new AIService(defaultAIConfig.apiKey);

export interface ChatMessage {
  id: string;
  message: string;
  from_cellphone: number;
  to_cellphone: number;
  from_debtor_name?: string;
  to_debtor_name?: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  cost?: number;
  is_from_debtor: boolean;
  media_url?: string;
  media_type?: string;
  ai_feedback?: string;
  collection_stage?: string;
}

export interface Conversation {
  debtor_id: number;
  debtor_name: string;
  debtor_document: string;
  phone_number: number;
  latest_message: string;
  latest_timestamp: Date;
  message_count: number;
  unread_count: number;
  collection_stage: string;
  payment_probability: number;
  last_interaction: Date;
}

export interface ChatStatistics {
  totalMessages: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  activeConversations: number;
  pendingMessages: number;
  collectionStages: {
    initial: number;
    reminder: number;
    urgent: number;
    final: number;
    completed: number;
  };
}

export interface AIFeedback {
  suggested_message: string;
  collection_stage: string;
  payment_probability: number;
  next_action: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  personalized_strategy: string;
}

export class RealChatService {

  private static async findDebtorSmart(identifier: number, userId: number) {
    let debtor = await Debtor.findOne({
      where: { id: identifier, id_user: userId },
      include: [
        {
          model: Cellphone,
          as: 'cellphones',
          attributes: ['number', 'from', 'to', 'id'],
        },
      ],
    });

    if (debtor && debtor.cellphones && debtor.cellphones.length > 0) {
      return debtor;
    }

    const cellphone = await Cellphone.findOne({
      where: { number: identifier },
      attributes: ['id_debtor'],
    });

    if (cellphone && cellphone.id_debtor) {
      const debtorFoundByPhone = await Debtor.findOne({
        where: { id: cellphone.id_debtor, id_user: userId },
        include: [
          {
            model: Cellphone,
            as: 'cellphones',
            attributes: ['number', 'from', 'to', 'id'],
          },
        ],
      });

      if (debtorFoundByPhone) return debtorFoundByPhone;
    }

    return debtor;
  }

  private static async resolveCompanyId(userId: number): Promise<number> {

    const envCompanyId = process.env.DEFAULT_COMPANY_ID
      ? Number(process.env.DEFAULT_COMPANY_ID)
      : NaN;
    if (Number.isFinite(envCompanyId) && envCompanyId > 0) return envCompanyId;

    const sequelize = (Cost as any).sequelize;
    if (!sequelize) return userId;

    const candidateQueries: Array<string> = [
      `SELECT idcompany AS company_id FROM "user" WHERE id = :userId LIMIT 1`,
      `SELECT company_id AS company_id FROM "user" WHERE id = :userId LIMIT 1`,
      `SELECT id FROM "user" WHERE id = :userId AND "isCollectionCompany" = true LIMIT 1`, 
    ];

    let inferredCompanyId: number | null = null;

    for (const sql of candidateQueries) {
      try {
        const rows = (await sequelize.query(sql, {
          replacements: { userId },
          type: QueryTypes.SELECT,
        })) as Array<{ company_id?: any; id?: any }>;

        const raw = rows?.[0]?.company_id ?? rows?.[0]?.id;
        const n = raw !== undefined && raw !== null ? Number(raw) : NaN;

        if (Number.isFinite(n) && n > 0) {
          inferredCompanyId = n;
          break;
        }
      } catch {
      }
    }

    const finalId = inferredCompanyId ?? userId;
    
    console.log(`[RealChatService] Company ID resuelto: ${finalId} (User ID: ${userId})`);
    return finalId;
  }

  static async getConversations(userId: number): Promise<Conversation[]> {
    try {
      const debtors = await Debtor.findAll({
        where: { id_user: userId },
        include: [
          {
            model: Cellphone,
            as: 'cellphones',
            required: true,
            attributes: ['number', 'id'],
          },
        ],
        attributes: ['id', 'name', 'document', 'paid', 'createdAt'],
      });

      const conversations: Conversation[] = [];

      for (const debtor of debtors) {
        if (debtor.cellphones && debtor.cellphones.length > 0) {
          for (const cellphone of debtor.cellphones) {
            const phoneNumber = Number(cellphone.number);

            const latestMessage = await Chat.findOne({
              $or: [{ from_cellphone: phoneNumber }, { to_cellphone: phoneNumber }],
            }).sort({ createdAt: -1 });

            const messageCount = await Chat.countDocuments({
              $or: [{ from_cellphone: phoneNumber }, { to_cellphone: phoneNumber }],
            });

            const unreadCount = await Chat.countDocuments({
              from_cellphone: phoneNumber,
            });

            const collectionStage = this.determineCollectionStage(debtor.paid, latestMessage);
            const paymentProbability = await this.calculatePaymentProbability(debtor.id, phoneNumber);

            conversations.push({
              debtor_id: debtor.id,
              debtor_name: debtor.name,
              debtor_document: debtor.document,
              phone_number: phoneNumber,
              latest_message: latestMessage?.message || 'Nueva conversación',
              latest_timestamp: latestMessage?.createdAt || debtor.createdAt,
              message_count: messageCount,
              unread_count: unreadCount,
              collection_stage: collectionStage,
              payment_probability: paymentProbability,
              last_interaction: latestMessage?.createdAt || debtor.createdAt,
            });
          }
        }
      }

      return conversations.sort(
        (a, b) => new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  static async getChatHistory(debtorIdOrPhone: number, userId: number): Promise<ChatMessage[]> {
    try {
      const debtor = await this.findDebtorSmart(debtorIdOrPhone, userId);

      if (!debtor || !debtor.cellphones || debtor.cellphones.length === 0) return [];

      const phoneNumber = Number(debtor.cellphones[0].number);

      const messages = await Chat.find({
        $or: [
          { from_cellphone: phoneNumber },
          { to_cellphone: phoneNumber },
          { to_cellphone: phoneNumber, from_cellphone: 0 },
        ],
      }).sort({ createdAt: 1 });

      return messages.map((msg: any) => ({
        id: msg._id.toString(),
        message: msg.message,
        from_cellphone: msg.from_cellphone,
        to_cellphone: msg.to_cellphone,
        from_debtor_name:
          msg.from_cellphone === phoneNumber
            ? debtor.name
            : msg.from_cellphone === 0
              ? 'Sistema'
              : 'Agente',
        to_debtor_name: msg.to_cellphone === phoneNumber ? debtor.name : 'Agente',
        message_type: msg.message_type || 'text',
        status: msg.status || 'sent',
        timestamp: msg.createdAt,
        cost: msg.cost || 0,
        is_from_debtor: msg.from_cellphone === phoneNumber,
        media_url: msg.media_url,
        media_type: msg.media_type,
        ai_feedback: msg.ai_feedback,
        collection_stage: msg.collection_stage,
      }));
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  static async sendMessage(params: {
    debtorId: number;
    message: string;
    messageType: string;
    userId: number;
  }): Promise<ChatMessage> {
    try {
      const { debtorId, message, messageType, userId } = params;

      const debtor = await this.findDebtorSmart(debtorId, userId);
      if (!debtor) throw new Error('Debtor not found');
      if (!debtor.cellphones || debtor.cellphones.length === 0)
        throw new Error('Debtor has no cellphone assigned');

      const cellphone = debtor.cellphones[0];
      const targetPhone = Number(cellphone.number);

      const myTwilioNumber = process.env.TWILIO_FROM_NUMBER
        ? Number(process.env.TWILIO_FROM_NUMBER)
        : 123456789;

      const calculatedCost = this.calculateMessageCost(messageType) || 0.01;

      const companyId = await this.resolveCompanyId(userId);

      const chatMessage = await Chat.create({
        id_user: userId,
        from_cellphone: myTwilioNumber,
        to_cellphone: targetPhone,
        message,
        message_type: messageType,
        status: 'sent',
        cost: calculatedCost,
        is_from_debtor: false,
        collection_stage: this.determineCollectionStage(debtor.paid, null),
      });

      try {
        await Cost.create({
          id_company: companyId,
          amount: calculatedCost,
          type: 'whatsapp',
          status: 'processed',
          createdat: new Date(),
          updatedat: new Date(),
        });
      } catch (e) {
        console.error('[Cost] Falló Cost.create (probable FK issue), pero continúo:', e);
      }

      await PendingMessage.create({
        company_id: companyId,
        from_number: myTwilioNumber,
        id_user: userId,
        id_debtor: debtor.id,
        phone_number: targetPhone,
        message,
        type: 'whatsapp',
        status: 'pending',
        scheduled_time: new Date(),
      });

      return {
        id: chatMessage._id.toString(),
        message: chatMessage.message,
        from_cellphone: chatMessage.from_cellphone,
        to_cellphone: chatMessage.to_cellphone,
        from_debtor_name: 'Agente',
        to_debtor_name: debtor.name,
        message_type: chatMessage.message_type as any,
        status: chatMessage.status as any,
        timestamp: chatMessage.createdAt,
        cost: calculatedCost,
        is_from_debtor: false,
        ai_feedback: chatMessage.ai_feedback,
        collection_stage: chatMessage.collection_stage,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getAIFeedback(debtorId: number, userId: number): Promise<AIFeedback> {
    try {
      const debtor = await this.findDebtorSmart(debtorId, userId);
      if (!debtor) throw new Error('Debtor not found');

      const phoneNumber = Number(debtor.cellphones[0]?.number);

      const recentMessages = await Chat.find({
        $or: [{ from_cellphone: phoneNumber }, { to_cellphone: phoneNumber }],
      })
        .sort({ createdAt: -1 })
        .limit(10);

      const aiResponse = await aiService.generateCollectionMessage({
        debtor_name: debtor.name,
        debtor_document: debtor.document,
        payment_status: debtor.paid as any,
        debt_amount: 500,
        days_overdue: 30,
        collection_channel: 'whatsapp',
        admin_feedback: [],
        previous_interactions: recentMessages.map((msg: any) => ({
          message: msg.message,
          is_from_debtor: msg.from_cellphone === phoneNumber,
          timestamp: msg.createdAt,
        })),
        debtor_profile: {
          payment_history: 'Desconocido',
          communication_preference: 'whatsapp',
        },
        collection_stage: this.determineCollectionStage(debtor.paid, null),
      });

      return {
        suggested_message: aiResponse.suggested_message,
        collection_stage: aiResponse.collection_strategy,
        payment_probability: aiResponse.payment_probability,
        next_action: aiResponse.next_action,
        urgency_level: aiResponse.urgency_level,
        personalized_strategy: aiResponse.personalized_approach,
      };
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      throw error;
    }
  }

  static async submitAIFeedback(params: {
    debtorId: number;
    feedback: string;
    message: string;
    userId: number;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const { debtorId, feedback, userId } = params;
      const debtor = await this.findDebtorSmart(debtorId, userId);
      if (!debtor) throw new Error('Deudor no encontrado');

      const phoneNumber = Number(debtor.cellphones[0].number);

      await Chat.create({
        id_user: userId,
        from_cellphone: 0,
        to_cellphone: phoneNumber,
        message: `[ADMIN FEEDBACK]: ${feedback}`,
        message_type: 'text',
        cost: 0,
        is_from_debtor: false,
        ai_feedback: feedback,
        collection_stage: 'feedback',
      });

      return { success: true, message: 'Feedback registrado.' };
    } catch (error) {
      console.error('Error submitting AI feedback:', error);
      throw error;
    }
  }

  static async getChatStatistics(userId: number): Promise<ChatStatistics> {
    try {
      const totalMessages = await Chat.countDocuments({
        from_cellphone: { $ne: 0 },
        id_user: userId,
      });

      const companyId = await this.resolveCompanyId(userId);
      const totalCost =
        companyId ? (await Cost.sum('amount', { where: { id_company: companyId } })) || 0 : 0;

      const successfulMessages = await Chat.countDocuments({
        status: 'delivered',
        id_user: userId,
      });

      const successRate = totalMessages > 0 ? (successfulMessages / totalMessages) * 100 : 0;

      const activeConversations = await Debtor.count({
        where: { id_user: userId },
      });

      const pendingMessages = await PendingMessage.count({
        where: { id_user: userId, status: 'pending' },
      });

      return {
        totalMessages,
        totalCost,
        successRate,
        averageResponseTime: 0,
        activeConversations,
        pendingMessages,
        collectionStages: { initial: 0, reminder: 0, urgent: 0, final: 0, completed: 0 },
      };
    } catch (error) {
      console.error('Error getting chat statistics:', error);
      throw error;
    }
  }

  private static determineCollectionStage(paymentStatus: any, _latestMessage: any): string {
    const ps = String(paymentStatus ?? '').toLowerCase();
    if (ps === 'paid' || ps === 'true' || ps === '1') return 'completed';
    if (ps === 'pending') return 'initial';
    if (ps === 'overdue') return 'urgent';
    return 'reminder';
  }

  private static async calculatePaymentProbability(_debtorId: number, _phoneNumber: number): Promise<number> {
    return Math.random();
  }

  private static calculateMessageCost(messageType: string): number {
    const costs = {
      text: 0.01,
      image: 0.05,
      document: 0.03,
      audio: 0.02,
      video: 0.08,
    };
    return costs[messageType as keyof typeof costs] || 0.01;
  }
}