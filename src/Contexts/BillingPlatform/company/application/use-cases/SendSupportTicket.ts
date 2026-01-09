import { EMAIL_TO_SEND_TICKETS } from "../../../../../config/Constants";
import { EmailService } from "../../../../Shared/infrastructure/email/EmailService";
import { CompanyRepository } from "../../domain/CompanyRepository";
import { Ticket, TicketType } from "../../domain/Ticket";
import { TicketRepository } from "../../domain/TicketRepository";

export class SendSupportTicket {
  constructor(
    private readonly emailService: EmailService,
    private readonly companyRepository: CompanyRepository,
    private readonly ticketRepository: TicketRepository
  ) {}

  async run(params: { idUser: number; subject: string; message: string }) {
    const company = await this.companyRepository.findById(params.idUser);

    if (!company) {
      throw new Error("Company not found");
    }

    const ticket = Ticket.create({
      idCompany: params.idUser,
      subject: params.subject,
      message: params.message,
      type: TicketType.SUPPORT,
    });

    await Promise.all([
      this.ticketRepository.save(ticket),
      this.emailService.send({
        to: EMAIL_TO_SEND_TICKETS,
        subject: `TICKET:${company.id};${company.email};${params.subject}`,
        body: params.message,
      }),
    ]);
  }
}
