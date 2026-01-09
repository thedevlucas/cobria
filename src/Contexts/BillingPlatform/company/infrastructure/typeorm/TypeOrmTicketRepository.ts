import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Ticket, TicketType } from "../../domain/Ticket";
import { TicketRepository } from "../../domain/TicketRepository";
import { TicketEntity } from "./TicketEntity";

export class TypeOrmTicketRepository
  extends TypeOrmRepository<Ticket>
  implements TicketRepository
{
  protected entitySchema(): EntitySchema<Ticket> {
    return TicketEntity;
  }

  async save(ticket: Ticket): Promise<void> {
    return this.persist(ticket);
  }

  async findById(id: number): Promise<Ticket | null> {
    const repository = await this.repository();
    return repository.findOne({
      where: { id },
    });
  }

  async findAll(type: TicketType): Promise<Ticket[]> {
    const repository = await this.repository();

    return repository.find({
      where: { type },
    });
  }

  async findAllByCompany(
    idCompany: number,
    type: TicketType
  ): Promise<Ticket[]> {
    const repository = await this.repository();
    return repository.find({
      where: { idCompany, type },
    });
  }
}
