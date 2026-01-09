import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";

export class UpdateDebtorStage {
  constructor(private readonly debtorRepository: DebtorRepository) {}

  async run(params: {
    debtorId: number;
    newStage: string;
    notes?: string;
    userId: number;
  }): Promise<void> {
    // Get the debtor
    const debtors = await this.debtorRepository.findByCompany(params.userId);
    const debtor = debtors?.find((d: any) => d.id === params.debtorId);
    
    if (!debtor) {
      throw new Error("Debtor not found");
    }

    // Map stage to payment status
    const newPaymentStatus = this.mapStageToPaymentStatus(params.newStage);
    
    // Update debtor status
    debtor.paid = newPaymentStatus;
    
    // Add notes to events if provided
    if (params.notes) {
      const currentEvents = debtor.events || "";
      const newEvent = `${params.newStage}: ${params.notes} (${new Date().toISOString()})`;
      debtor.events = currentEvents ? `${currentEvents}, ${newEvent}` : newEvent;
    }

    // Save the updated debtor
    await this.debtorRepository.save(debtor);
  }

  private mapStageToPaymentStatus(stage: string): PaymentStatus {
    switch (stage) {
      case "initial_contact":
        return PaymentStatus.NO_CONTACT;
      case "follow_up":
        return PaymentStatus.CONTACT;
      case "negotiation":
        return PaymentStatus.PAYMENT_AGREEMENMT;
      case "payment_arrangement":
        return PaymentStatus.FINANCED_PAYMENT;
      case "collection_complete":
        return PaymentStatus.PAID;
      default:
        return PaymentStatus.NO_CONTACT;
    }
  }
}
