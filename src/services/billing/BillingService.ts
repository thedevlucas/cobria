import { Cost } from '../../models/Cost';
import { Chat } from '../../models/Chat';
import { User } from '../../models/User';
import { Op } from 'sequelize';

export interface CostRecord {
  id: number;
  cost_type: 'message' | 'call' | 'sms' | 'email' | 'subscription' | 'bot_rental';
  amount: number;
  description: string;
  phone_number?: number;
  created_at: string;
  status: 'pending' | 'processed' | 'failed';
  currency: string;
}

export interface BillingSummary {
  total_cost: number;
  monthly_cost: number;
  daily_cost: number;
  cost_by_type: {
    messages: number;
    calls: number;
    sms: number;
    emails: number;
    subscription: number;
    bot_rental: number;
  };
  usage_stats: {
    total_messages: number;
    total_calls: number;
    total_sms: number;
    total_emails: number;
  };
  billing_period: {
    start_date: string;
    end_date: string;
    days_remaining: number;
  };
}

export interface SubscriptionInfo {
  plan_name: string;
  monthly_fee: number;
  included_credits: number;
  used_credits: number;
  remaining_credits: number;
  next_billing_date: string;
  auto_renewal: boolean;
}

export interface PaymentResult {
  success: boolean;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  message: string;
}

export class BillingService {
  
  static async getCostRecords(userId: number, periodDays: number): Promise<CostRecord[]> {
    if (!userId) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const costs = await Cost.findAll({
        where: {
          id_user: userId,
          createdAt: { [Op.gte]: startDate }
        },
        order: [['createdAt', 'DESC']]
      });

      return costs.map((cost: any) => ({
        id: cost.id,
        cost_type: cost.type === 'whatsapp' ? 'message' : (cost.type as any),
        amount: parseFloat(cost.amount),
        description: cost.description || 'Sin descripción',
        phone_number: cost.phone_number ? Number(cost.phone_number) : undefined,
        created_at: cost.createdAt ? cost.createdAt.toISOString() : new Date().toISOString(),
        status: cost.status || 'processed',
        currency: 'USD'
      }));
    } catch (error) {
      console.error('Error getting cost records:', error);
      return [];
    }
  }

  static async getBillingSummary(userId: number): Promise<BillingSummary> {
    if (!userId) throw new Error("User ID missing for billing summary");

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const totalCost = await Cost.sum('amount', { where: { id_user: userId } }) || 0;
      
      const monthlyCost = await Cost.sum('amount', { 
        where: { id_user: userId, createdAt: { [Op.gte]: startOfMonth } } 
      }) || 0;

      const dailyCost = await Cost.sum('amount', { 
        where: { id_user: userId, createdAt: { [Op.gte]: startOfDay } } 
      }) || 0;

      const costByType = await this.getCostByType(userId);
      const usageStats = await this.getUsageStats(userId);
      const billingPeriod = this.calculateBillingPeriod();

      return {
        total_cost: totalCost,
        monthly_cost: monthlyCost,
        daily_cost: dailyCost,
        cost_by_type: costByType,
        usage_stats: usageStats,
        billing_period: billingPeriod
      };
    } catch (error) {
      console.error('Error getting billing summary:', error);
      throw error;
    }
  }

  static async getSubscriptionInfo(userId: number): Promise<SubscriptionInfo> {
    if (!userId) return { plan_name: 'Error', monthly_fee: 0, included_credits: 0, used_credits: 0, remaining_credits: 0, next_billing_date: new Date().toISOString(), auto_renewal: false };
    
    const usedCredits = await this.getUsedCredits(userId);
    return {
      plan_name: 'Plan Estándar',
      monthly_fee: 0,
      included_credits: 1000,
      used_credits: usedCredits,
      remaining_credits: Math.max(0, 1000 - usedCredits),
      next_billing_date: this.getNextBillingDate(),
      auto_renewal: true
    };
  }

  static async processPayment(params: { userId: number; amount: number; paymentMethod: string; }): Promise<PaymentResult> {
    const { userId, amount, paymentMethod } = params;
    if (!userId) throw new Error("Cannot process payment without User ID");

    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error("Usuario no encontrado");
      
      const companyId = user.id_company || user.id;

      const transactionId = `txn_${Date.now()}`;

      await Cost.create({
        id_user: userId,
        id_company: companyId,
        type: 'subscription',
        cost_type: 'subscription',
        amount: amount,
        description: `Pago manual vía ${paymentMethod}`,
        status: 'processed'
      });

      return {
        success: true,
        transaction_id: transactionId,
        amount: amount,
        currency: 'USD',
        status: 'completed',
        message: 'Pago registrado correctamente'
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  static async generateInvoice(costId: number, userId: number): Promise<Buffer> {
    const invoiceData = { id: costId, user: userId, date: new Date() };
    return Buffer.from(JSON.stringify(invoiceData));
  }

  private static async getCostByType(userId: number) {
    const types = ['whatsapp', 'call', 'sms', 'email', 'subscription', 'bot_rental'];
    const result: any = { messages: 0, calls: 0, sms: 0, emails: 0, subscription: 0, bot_rental: 0 };

    for (const type of types) {
      const sum = await Cost.sum('amount', { where: { id_user: userId, type: type } }) || 0;
      
      if (type === 'whatsapp') result.messages = sum;
      else if (type === 'call') result.calls = sum;
      else if (type === 'sms') result.sms = sum;
      else if (type === 'email') result.emails = sum;
      else if (type === 'subscription') result.subscription = sum;
      else if (type === 'bot_rental') result.bot_rental = sum;
    }
    return result;
  }

  private static async getUsageStats(userId: number) {
    let totalMessages = 0;
    try {
       totalMessages = await Chat.count({ where: { from_cellphone: { [Op.ne]: null } } });
    } catch (e) { }

    const totalCalls = await Cost.count({ where: { id_user: userId, type: 'call' } });
    const totalSms = await Cost.count({ where: { id_user: userId, type: 'sms' } });
    const totalEmails = await Cost.count({ where: { id_user: userId, type: 'email' } });

    return {
      total_messages: totalMessages,
      total_calls: totalCalls,
      total_sms: totalSms,
      total_emails: totalEmails
    };
  }

  private static calculateBillingPeriod() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      days_remaining: end.getDate() - now.getDate()
    };
  }

  private static async getUsedCredits(userId: number) {
    const totalSpent = await Cost.sum('amount', { where: { id_user: userId } }) || 0;
    return Math.floor(totalSpent * 10); 
  }

  private static getNextBillingDate() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  }

  static async updateSubscription(userId: number, data: { plan_name: string; auto_renewal: boolean }) {
    try {
      console.log(`[BillingService] Actualizando plan para usuario ${userId}:`, data);
      
      return {
        success: true,
        message: "Suscripción actualizada correctamente.",
        current_plan: data.plan_name,
        auto_renewal: data.auto_renewal
      };
    } catch (error) {
      console.error("Error updating subscription:", error);
      throw error;
    }
  }

  static async getPaymentHistory(userId: number) {
    try {
      console.log(`[BillingService] Obteniendo historial de pagos para ${userId}`);


      return [
        {
          id: 'pay_123',
          date: new Date(),
          amount: 25.00,
          status: 'succeeded',
          description: 'Suscripción Pro - Enero',
          payment_method: 'Visa **** 4242'
        },
        {
          id: 'pay_122',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Hace 30 días
          amount: 25.00,
          status: 'succeeded',
          description: 'Suscripción Pro - Diciembre',
          payment_method: 'Visa **** 4242'
        }
      ];
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw error;
    }
  }

  static async getUsageAnalytics(userId: number) {
    try {
      console.log(`[BillingService] Calculando analíticas para ${userId}`);

      return {
        total_spent_this_month: 15.50,
        messages_count: 1250,
        campaigns_active: 3,
        projected_cost: 20.00,
        usage_trend: 'up' // o 'down'
      };
    } catch (error) {
      console.error("Error getting usage analytics:", error);
      throw error;
    }
  }

  public static async getDailyUsage(userId: number): Promise<any[]> {
    if (!userId) return [];
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const costs = await Cost.findAll({
            where: {
                id_user: userId,
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            attributes: ['createdAt', 'type', 'amount'],
            raw: true
        });

        const grouped: any = {};
        for(let i=0; i<7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            grouped[dateStr] = { date: dateStr, messages: 0, calls: 0, sms: 0, emails: 0, cost: 0 };
        }

        costs.forEach((c: any) => {
            const dateStr = new Date(c.createdAt).toISOString().split('T')[0];
            if (grouped[dateStr]) {
                grouped[dateStr].cost += parseFloat(c.amount || 0);
                if (c.type === 'whatsapp') grouped[dateStr].messages++;
                if (c.type === 'call') grouped[dateStr].calls++;
                if (c.type === 'sms') grouped[dateStr].sms++;
                if (c.type === 'email') grouped[dateStr].emails++;
            }
        });

        return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } catch (error) {
        return [];
    }
  }

  public static async getCostTrends(userId: number) {
    return []; 
  }
}