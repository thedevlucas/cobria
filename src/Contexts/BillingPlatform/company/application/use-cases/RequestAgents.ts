import { EMAIL_TO_SEND_TICKETS } from "../../../../../config/Constants";
import { EmailService } from "../../../../Shared/infrastructure/email/EmailService";
import { CompanyRepository } from "../../domain/CompanyRepository";
import { Ticket, TicketType } from "../../domain/Ticket";
import { TicketRepository } from "../../domain/TicketRepository";

export class RequestAgents {
  constructor(
    private readonly emailService: EmailService,
    private readonly companyRepository: CompanyRepository,
    private readonly ticketRepository: TicketRepository
  ) {}

  async run(params: {
    idCompany: number;
    agents: { phone: string; name: string; months: number }[];
  }) {
    const { idCompany, agents } = params;
    const company = await this.companyRepository.findById(idCompany);

    if (!company) {
      throw new Error("Company not found");
    }

    const message =
      `La empresa ${
        company.name
      } ha solicitado la compra de los siguientes agentes: <ul>
    ${agents
      .map(
        (agent) =>
          `<li>Nombre: ${agent.name}, Numero: ${agent.phone}, Meses: ${agent.months}<\li>`
      )
      .join("\n")}` + `</ul>`;

    const ticket = Ticket.create({
      idCompany,
      subject: "SOLICITUD DE AGENTES",
      message,
      type: TicketType.REQUEST_AGENTS,
    });

    await Promise.all([
      this.ticketRepository.save(ticket),
      this.emailService.send({
        to: EMAIL_TO_SEND_TICKETS,
        subject: "SOLICITUD DE AGENTES",
        body: message,
      }),
    ]);
  }
}
