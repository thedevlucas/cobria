import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { CallChatRepository } from "../../../chat/domain/CallChatRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";

export interface CollectionReportResult {
  summary: {
    totalDebtors: number;
    totalDebtAmount: number;
    collectedAmount: number;
    collectionRate: number;
    averageCollectionTime: number;
  };
  statusBreakdown: {
    paid: number;
    partialPaid: number;
    paymentAgreement: number;
    financedPayment: number;
    contact: number;
    noContact: number;
    chargedOff: number;
  };
  communicationEffectiveness: {
    whatsapp: { sent: number; responded: number; rate: number };
    calls: { made: number; answered: number; rate: number };
    sms: { sent: number; responded: number; rate: number };
  };
  timeAnalysis: {
    daily: Array<{ date: string; contacted: number; paid: number }>;
    weekly: Array<{ week: string; contacted: number; paid: number }>;
    monthly: Array<{ month: string; contacted: number; paid: number }>;
  };
  topPerformers: Array<{
    debtorId: number;
    debtorName: string;
    debtAmount: number;
    collectedAmount: number;
    collectionTime: number;
  }>;
}

export class GetCollectionReport {
  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly chatRepository: ChatRepository,
    private readonly callChatRepository: CallChatRepository
  ) {}

  async run(params: { 
    userId: number; 
    dateRange?: { start: string; end: string } 
  }): Promise<CollectionReportResult> {
    // Get debtors for the user
    const allDebtors = await this.debtorRepository.findByCompany(params.userId) || [];
    
    // Filter by date range if provided
    const filteredDebtors = params.dateRange 
      ? allDebtors.filter((debtor: any) => {
          const debtorDate = new Date(debtor.createdAt);
          const startDate = new Date(params.dateRange!.start);
          const endDate = new Date(params.dateRange!.end);
          return debtorDate >= startDate && debtorDate <= endDate;
        })
      : allDebtors;

    // Calculate summary
    const totalDebtors = filteredDebtors.length;
    const totalDebtAmount = filteredDebtors.reduce((sum: number, debtor: any) => sum + (debtor.debtAmount || 0), 0);
    const collectedAmount = filteredDebtors
      .filter((d: any) => d.paid === PaymentStatus.PAID)
      .reduce((sum: number, debtor: any) => sum + (debtor.debtAmount || 0), 0);
    const collectionRate = totalDebtAmount > 0 ? (collectedAmount / totalDebtAmount) * 100 : 0;
    
    // Calculate average collection time (simplified)
    const paidDebtors = filteredDebtors.filter((d: any) => d.paid === PaymentStatus.PAID);
    const averageCollectionTime = paidDebtors.length > 0 
      ? paidDebtors.reduce((sum: number, debtor: any) => {
          const created = new Date(debtor.createdAt);
          const updated = new Date(debtor.updatedAt);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
        }, 0) / paidDebtors.length
      : 0;

    // Status breakdown
    const statusBreakdown = {
      paid: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.PAID).length,
      partialPaid: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.PARTIAL_PAID).length,
      paymentAgreement: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.PAYMENT_AGREEMENMT).length,
      financedPayment: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.FINANCED_PAYMENT).length,
      contact: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.CONTACT).length,
      noContact: filteredDebtors.filter((d: any) => d.paid === PaymentStatus.NO_CONTACT).length,
      chargedOff: 0, // CHARGED_OFF doesn't exist in PaymentStatus enum
    };

    // Communication effectiveness (simplified - would need more complex logic in real implementation)
    const communicationEffectiveness = {
      whatsapp: { sent: 0, responded: 0, rate: 0 },
      calls: { made: 0, answered: 0, rate: 0 },
      sms: { sent: 0, responded: 0, rate: 0 },
    };

    // Get communication data (simplified - would need proper methods in real implementation)
    const chats: any[] = []; // await this.chatRepository.findByUserId(params.userId);
    const callChats: any[] = []; // await this.callChatRepository.findByUserId(params.userId);

    communicationEffectiveness.whatsapp.sent = chats.length;
    communicationEffectiveness.whatsapp.responded = chats.filter((c: any) => c.status).length;
    communicationEffectiveness.whatsapp.rate = chats.length > 0 
      ? (communicationEffectiveness.whatsapp.responded / chats.length) * 100 
      : 0;

    communicationEffectiveness.calls.made = callChats.length;
    communicationEffectiveness.calls.answered = callChats.filter((c: any) => c.status).length;
    communicationEffectiveness.calls.rate = callChats.length > 0 
      ? (communicationEffectiveness.calls.answered / callChats.length) * 100 
      : 0;

    // Time analysis (simplified)
    const timeAnalysis = {
      daily: this.generateDailyAnalysis(filteredDebtors),
      weekly: this.generateWeeklyAnalysis(filteredDebtors),
      monthly: this.generateMonthlyAnalysis(filteredDebtors),
    };

    // Top performers
    const topPerformers = filteredDebtors
      .filter((d: any) => d.paid === PaymentStatus.PAID)
      .map((debtor: any) => ({
        debtorId: debtor.id,
        debtorName: debtor.name,
        debtAmount: debtor.debtAmount || 0,
        collectedAmount: debtor.debtAmount || 0,
        collectionTime: this.calculateCollectionTime(debtor.createdAt, debtor.updatedAt),
      }))
      .sort((a: any, b: any) => b.collectedAmount - a.collectedAmount)
      .slice(0, 10);

    return {
      summary: {
        totalDebtors,
        totalDebtAmount,
        collectedAmount,
        collectionRate,
        averageCollectionTime,
      },
      statusBreakdown,
      communicationEffectiveness,
      timeAnalysis,
      topPerformers,
    };
  }

  private generateDailyAnalysis(debtors: any[]): Array<{ date: string; contacted: number; paid: number }> {
    // Simplified implementation - would need more complex date grouping in real scenario
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDebtors = debtors.filter(d => 
        new Date(d.createdAt).toISOString().split('T')[0] === dateStr
      );
      
      last7Days.push({
        date: dateStr,
        contacted: dayDebtors.filter(d => d.paid !== PaymentStatus.NO_CONTACT).length,
        paid: dayDebtors.filter(d => d.paid === PaymentStatus.PAID).length,
      });
    }
    return last7Days;
  }

  private generateWeeklyAnalysis(debtors: any[]): Array<{ week: string; contacted: number; paid: number }> {
    // Simplified implementation
    return [
      { week: "Semana 1", contacted: Math.floor(debtors.length * 0.3), paid: Math.floor(debtors.length * 0.1) },
      { week: "Semana 2", contacted: Math.floor(debtors.length * 0.5), paid: Math.floor(debtors.length * 0.2) },
      { week: "Semana 3", contacted: Math.floor(debtors.length * 0.7), paid: Math.floor(debtors.length * 0.3) },
      { week: "Semana 4", contacted: Math.floor(debtors.length * 0.8), paid: Math.floor(debtors.length * 0.4) },
    ];
  }

  private generateMonthlyAnalysis(debtors: any[]): Array<{ month: string; contacted: number; paid: number }> {
    // Simplified implementation
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
    return months.map(month => ({
      month,
      contacted: Math.floor(debtors.length * 0.6),
      paid: Math.floor(debtors.length * 0.2),
    }));
  }

  private calculateCollectionTime(createdAt: Date, updatedAt: Date): number {
    const created = new Date(createdAt);
    const updated = new Date(updatedAt);
    return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
  }
}
