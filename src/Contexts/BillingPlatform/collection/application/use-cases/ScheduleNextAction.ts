import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";

export class ScheduleNextAction {
  constructor(private readonly debtorRepository: DebtorRepository) {}

  async run(params: {
    debtorId: number;
    action: string;
    scheduledDate: Date;
    userId: number;
  }): Promise<void> {
    // Get the debtor
    const debtors = await this.debtorRepository.findByCompany(params.userId);
    const debtor = debtors?.find((d: any) => d.id === params.debtorId);
    
    if (!debtor) {
      throw new Error("Debtor not found");
    }

    // Add scheduled action to events
    const currentEvents = debtor.events || "";
    const scheduledEvent = `Scheduled: ${params.action} for ${params.scheduledDate.toISOString()}`;
    debtor.events = currentEvents ? `${currentEvents}, ${scheduledEvent}` : scheduledEvent;

    // Save the updated debtor
    await this.debtorRepository.save(debtor);
  }
}
