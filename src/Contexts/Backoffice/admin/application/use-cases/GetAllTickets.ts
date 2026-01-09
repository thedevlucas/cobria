import { TicketType } from "../../../../BillingPlatform/company/domain/Ticket";
import { TicketRepository } from "../../../../BillingPlatform/company/domain/TicketRepository";

export class GetAllTickets {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async run(params: { type: TicketType }) {
    return this.ticketRepository.findAll(params.type);
  }
}
