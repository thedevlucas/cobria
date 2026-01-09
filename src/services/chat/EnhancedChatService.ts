// Enhanced Chat Service - Senior Developer Implementation
import { Chat } from "../../models/Chat";
import { Debtor } from "../../models/Debtor";
import { User } from "../../models/User";
import { Cost } from "../../models/Cost";
import { Cellphone } from "../../models/Cellphone";
import { PendingMessage } from "../../models/PendingMessage";
import { twilio_whatsapp_number } from "../../config/Constants";
import { sendWhatsappMessage } from "./WhatsAppService";
import { httpError } from "../../config/CustomError";
import { Op, Sequelize } from "sequelize";

// Enhanced Chat Interface
export interface EnhancedChatMessage {
  id: number;
  message: string;
  from_cellphone: number;
  to_cellphone: number;
  debtor_name?: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  cost?: number;
  is_from_debtor: boolean;
  media_url?: string;
  media_type?: string;
}

// Chat Statistics Interface
export interface ChatStatistics {
  totalMessages: number;
  totalCost: number;
  successRate: number;
  averageResponseTime: number;
  activeConversations: number;
  pendingMessages: number;
}

// Enhanced Chat Service Class
export class EnhancedChatService {
  private async findDebtorByPhone(userId: number, phoneNumber: number) {
    const cellphone = await Cellphone.findOne({
        where: { number: phoneNumber },
        include: [
            {
                model: Debtor,
                as: 'debtor',
                where: { id_user: userId },
                required: true
            }
        ]
    });

    return cellphone?.debtor || null;
  }

  async getChatsByUser(userId: number, limit: number = 50, offset: number = 0) {
    try {
      const chats = await Chat.findAll({
        where: {
            id_user: userId,
            status: true
        },
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: offset
      });

      const enhancedChats = await Promise.all(
        chats.map(async (chat: any) => {
          const myNumber = parseInt(twilio_whatsapp_number?.replace('+', '') || '0');
          const debtorPhone = chat.from_cellphone === myNumber ? chat.to_cellphone : chat.from_cellphone;
          const debtor = await this.findDebtorByPhone(userId, debtorPhone);

          return {
            id: chat.id,
            message: chat.message,
            from_cellphone: chat.from_cellphone,
            to_cellphone: chat.to_cellphone,
            from_debtor_name: chat.from_cellphone === debtorPhone ? (debtor?.name || 'Desconocido') : 'Yo',
            to_debtor_name: chat.to_cellphone === debtorPhone ? (debtor?.name || 'Desconocido') : 'Yo',
            message_type: chat.message_type || 'text',
            status: chat.status ? 'delivered' : 'failed',
            timestamp: chat.createdAt,
            is_from_debtor: chat.from_cellphone !== myNumber,
            media_url: chat.media_url,
            media_type: chat.media_type
          };
        })
      );

      return enhancedChats;
    } catch (error) {
      console.error('Error getting chats by user:', error);
      throw new httpError('Error al obtener los chats', 500);
    }
  }

  async getChatHistory(userId: number, debtorPhone: number, limit: number = 100) {
    try {
      const chats = await Chat.findAll({
        where: {
            id_user: userId,
            status: true,
            [Op.or]: [
                { from_cellphone: debtorPhone },
                { to_cellphone: debtorPhone }
            ]
        },
        order: [['createdAt', 'ASC']],
        limit: limit
      });

      const debtor = await this.findDebtorByPhone(userId, debtorPhone);

      const enhancedChats = chats.map((chat: any) => ({
        id: chat.id,
        message: chat.message,
        from_cellphone: chat.from_cellphone,
        to_cellphone: chat.to_cellphone,
        debtor_name: debtor?.name || 'Unknown',
        message_type: chat.message_type || 'text',
        status: chat.status ? 'delivered' : 'failed',
        timestamp: chat.createdAt,
        is_from_debtor: Number(chat.from_cellphone) === Number(debtorPhone),
        media_url: chat.media_url,
        media_type: chat.media_type
      }));

      return enhancedChats;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw new httpError('Error al obtener el historial del chat', 500);
    }
  }

  async sendMessage(userId: number, toPhone: number, message: string, messageType: string = 'text', mediaUrl?: string) {
    try {
      if (!message && !mediaUrl) {
        throw new httpError('No se envió ningún mensaje', 400);
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new httpError('Usuario no encontrado', 404);
      }

      const debtor = await this.findDebtorByPhone(userId, toPhone);

      const twilioNumber = twilio_whatsapp_number!;
      await sendWhatsappMessage(twilioNumber, `+${toPhone}`, message, userId);

      let cost = 0.0339;
      
      await Cost.create({
        idcompany: userId, 
        amount: cost,
        type: 'whatsapp_message',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const chat = await Chat.create({
        id_user: userId,
        from_cellphone: parseInt(twilioNumber.replace('+', '')),
        to_cellphone: toPhone,
        message: message,
        status: true,
        message_type: messageType,
        media_url: mediaUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return {
        message: 'Mensaje enviado exitosamente',
        chat_id: chat.id,
        cost: cost,
        debtor_name: debtor?.name || 'Unknown'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new httpError('Error al enviar el mensaje', 500);
    }
  }

  async getChatStatistics(userId: number): Promise<ChatStatistics> {
    try {
      const totalMessages = await Chat.count({
        where: { id_user: userId, status: true }
      });

      const totalCostResult = await Cost.sum('amount', {
        where: { idcompany: userId }
      });
      const totalCost = Number(totalCostResult) || 0;

      const totalAttempts = await Chat.count({ where: { id_user: userId } });
      const successRate = totalAttempts > 0 ? (totalMessages / totalAttempts) * 100 : 0;

      const activeConversations = await Chat.count({
        where: {
            id_user: userId,
            status: true,
            createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        distinct: true,
        col: 'to_cellphone'
      });

      const pendingMessages = await PendingMessage.count({
        where: { company_id: userId, status: 'pending' }
      });

      return {
        totalMessages,
        totalCost,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: 0, 
        activeConversations: activeConversations,
        pendingMessages
      };
    } catch (error) {
      console.error('Error getting chat statistics:', error);
      throw new httpError('Error al obtener estadísticas del chat', 500);
    }
  }

  async getRecentConversations(userId: number, limit: number = 20) {
    try {
      const rawChats = await Chat.findAll({
        where: { id_user: userId },
        attributes: [
            [Sequelize.fn('MAX', Sequelize.col('id')), 'id'], 
            'to_cellphone', 
            'from_cellphone'
        ],
        group: ['to_cellphone', 'from_cellphone'],
        order: [[Sequelize.fn('MAX', Sequelize.col('id')), 'DESC']],
        limit: limit * 2
      });

      const myNumber = parseInt(twilio_whatsapp_number?.replace('+', '') || '0');
      const contactNumbers = new Set<number>();
      
      rawChats.forEach((c: any) => {
          const to = Number(c.to_cellphone);
          const from = Number(c.from_cellphone);
          if (to !== myNumber) contactNumbers.add(to);
          if (from !== myNumber) contactNumbers.add(from);
      });

      const recentChats = [];

      for (const phone of Array.from(contactNumbers).slice(0, limit)) {
          const lastMsg = await Chat.findOne({
              where: {
                  id_user: userId,
                  [Op.or]: [{ from_cellphone: phone }, { to_cellphone: phone }]
              },
              order: [['createdAt', 'DESC']]
          });

          if (!lastMsg) continue;

          const debtor = await this.findDebtorByPhone(userId, phone);

          recentChats.push({
            phone_number: phone,
            debtor_name: debtor?.name || 'Desconocido',
            latest_message: lastMsg.message,
            latest_timestamp: lastMsg.createdAt,
            message_count: 0,
            unread_count: 0
          });
      }

      return recentChats.sort((a, b) => b.latest_timestamp.getTime() - a.latest_timestamp.getTime());
      
    } catch (error) {
      console.error('Error getting recent conversations:', error);
      throw new httpError('Error al obtener conversaciones recientes', 500);
    }
  }

  async markMessagesAsRead(userId: number, phoneNumber: number) {
    try {
      await Chat.update(
        { read_at: new Date() },
        {
            where: {
                id_user: userId,
                from_cellphone: phoneNumber,
                status: true
            }
        }
      );
      return { message: 'Mensajes marcados como leídos' };
    } catch (error) {
      throw new httpError('Error al marcar mensajes como leídos', 500);
    }
  }

  async deleteConversation(userId: number, phoneNumber: number) {
    try {
      await Chat.destroy({
        where: {
            id_user: userId,
            [Op.or]: [
                { from_cellphone: phoneNumber },
                { to_cellphone: phoneNumber }
            ]
        }
      });
      return { message: 'Conversación eliminada' };
    } catch (error) {
      throw new httpError('Error al eliminar la conversación', 500);
    }
  }
}

// Export singleton instance
export const enhancedChatService = new EnhancedChatService();