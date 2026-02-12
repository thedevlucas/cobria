import { EntitySchema, LessThanOrEqual, IsNull } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { PendingMessageRepository } from "../../domain/PendingMessageRepository";
import { PendingMessage, PendingMessageStatus } from "../../domain/PendingMessages";
import { PendingMessageEntity } from "./PendinMessageEntity";

export class TypeOrmPendingMessageRepository
  extends TypeOrmRepository<PendingMessage>
  implements PendingMessageRepository
{
  protected entitySchema(): EntitySchema<PendingMessage> {
    return PendingMessageEntity;
  }

  async save(pendingMessage: PendingMessage): Promise<void> {
    return this.persist(pendingMessage);
  }

  async findAll(): Promise<PendingMessage[]> {
    const repository = await this.repository();
    return repository.find({ where: { status: PendingMessageStatus.PENDING } });
  }

  async findReadyToSend(): Promise<PendingMessage[]> {
    const repository = await this.repository();
    return repository.find({
      where: [
        {
          status: PendingMessageStatus.PENDING,
          scheduled_at: LessThanOrEqual(new Date()),
        },
        {
          status: PendingMessageStatus.PENDING,
          scheduled_at: IsNull(),
        }
      ],
      take: 50, // Lote de seguridad
      order: { scheduled_at: "ASC" }
    });
  }
}