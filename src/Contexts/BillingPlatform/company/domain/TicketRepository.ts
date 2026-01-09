import { Ticket, TicketType } from "./Ticket";

export interface TicketRepository {
  save(ticket: any): Promise<void>;
  findById(id: number): Promise<Ticket | null>;
  findAll(type: TicketType): Promise<Ticket[]>;
  findAllByCompany(idCompany: number, type: TicketType): Promise<Ticket[]>;
}
