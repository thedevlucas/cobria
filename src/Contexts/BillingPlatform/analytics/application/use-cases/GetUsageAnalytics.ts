import { CostRepository } from "../../../cost/domain/CostRepository";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { CallChatRepository } from "../../../chat/domain/CallChatRepository";
import { CostType } from "../../../cost/domain/Cost";
import { PaymentStatus } from "../../../debtor/domain/Debtor";

export interface UsageAnalyticsResult {
  totalCosts: number;
  monthlyCosts: number;
  communicationBreakdown: {
    whatsapp: { count: number; cost: number };
    calls: { count: number; cost: number };
    sms: { count: number; cost: number };
    email: { count: number; cost: number };
  };
  collectionMetrics: {
    totalDebtors: number;
    contacted: number;
    paid: number;
    partialPaid: number;
    noContact: number;
    collectionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    cost: number;
    timestamp: string;
  }>;
}

export class GetUsageAnalytics {
  constructor(
    private readonly costRepository: CostRepository,
    private readonly debtorRepository: DebtorRepository,
    private readonly chatRepository: ChatRepository,
    private readonly callChatRepository: CallChatRepository
  ) {}

  async run(params: { userId: number }): Promise<UsageAnalyticsResult> {
    // Get all costs for the user
    const allCosts = await this.costRepository.findCostsByCompany(params.userId);
    
    // Calculate total costs
    const totalCosts = allCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0);
    
    // Calculate monthly costs (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyCosts = allCosts
      .filter((cost: any) => new Date(cost.createdAt) >= currentMonth)
      .reduce((sum: number, cost: any) => sum + cost.amount, 0);

    // Calculate communication breakdown
    const communicationBreakdown = {
      whatsapp: { count: 0, cost: 0 },
      calls: { count: 0, cost: 0 },
      sms: { count: 0, cost: 0 },
      email: { count: 0, cost: 0 },
    };

    allCosts.forEach((cost: any) => {
      switch (cost.type) {
        case CostType.WHATSAPP:
          communicationBreakdown.whatsapp.count++;
          communicationBreakdown.whatsapp.cost += cost.amount;
          break;
        case CostType.CALL:
          communicationBreakdown.calls.count++;
          communicationBreakdown.calls.cost += cost.amount;
          break;
        case CostType.SMS:
          communicationBreakdown.sms.count++;
          communicationBreakdown.sms.cost += cost.amount;
          break;
        case CostType.EMAIL:
          communicationBreakdown.email.count++;
          communicationBreakdown.email.cost += cost.amount;
          break;
      }
    });

    // Get collection metrics
    const allDebtors = await this.debtorRepository.findByCompany(params.userId) || [];
    const totalDebtors = allDebtors.length;
    
    const contacted = allDebtors.filter((d: any) => d.paid !== PaymentStatus.NO_CONTACT).length;
    const paid = allDebtors.filter((d: any) => d.paid === PaymentStatus.PAID).length;
    const partialPaid = allDebtors.filter((d: any) => d.paid === PaymentStatus.PARTIAL_PAID).length;
    const noContact = allDebtors.filter((d: any) => d.paid === PaymentStatus.NO_CONTACT).length;
    
    const collectionRate = totalDebtors > 0 ? (paid / totalDebtors) * 100 : 0;

    // Get recent activity (last 10 activities)
    const recentCosts = allCosts
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const recentActivity = recentCosts.map((cost: any) => ({
      id: cost.id.toString(),
      type: this.getCostTypeLabel(cost.type),
      description: this.getCostDescription(cost.type),
      cost: cost.amount,
      timestamp: cost.createdAt.toISOString(),
    }));

    return {
      totalCosts,
      monthlyCosts,
      communicationBreakdown,
      collectionMetrics: {
        totalDebtors,
        contacted,
        paid,
        partialPaid,
        noContact,
        collectionRate,
      },
      recentActivity,
    };
  }

  private getCostTypeLabel(type: CostType): string {
    switch (type) {
      case CostType.WHATSAPP:
        return "WhatsApp";
      case CostType.CALL:
        return "Llamada";
      case CostType.SMS:
        return "SMS";
      case CostType.EMAIL:
        return "Email";
      case CostType.AGENT:
        return "Agente";
      default:
        return "Otro";
    }
  }

  private getCostDescription(type: CostType): string {
    switch (type) {
      case CostType.WHATSAPP:
        return "Mensaje de WhatsApp enviado";
      case CostType.CALL:
        return "Llamada telefónica realizada";
      case CostType.SMS:
        return "SMS enviado";
      case CostType.EMAIL:
        return "Email enviado";
      case CostType.AGENT:
        return "Uso de agente virtual";
      default:
        return "Costo operativo";
    }
  }
}
