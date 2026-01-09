import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { PendingMessageRepository } from "../../domain/PendingMessageRepository";
import {
  PendingMessage,
  PendingMessageStatus,
} from "../../domain/PendingMessages";
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
    return repository.find({
      where: {
        status: PendingMessageStatus.PENDING,
      },
    });
  }
}
