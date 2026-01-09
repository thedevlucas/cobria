import { TicketNotFoundException } from "../../../../BillingPlatform/company/domain/exceptions/TicketNotFound";
import { TicketRepository } from "../../../../BillingPlatform/company/domain/TicketRepository";

export class CloseTicket {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async run(params: { idTicket: number }): Promise<void> {
    const ticket = await this.ticketRepository.findById(params.idTicket);

    if (!ticket) {
      throw new TicketNotFoundException();
    }

    ticket.close();

    await this.ticketRepository.save(ticket);
  }
}
