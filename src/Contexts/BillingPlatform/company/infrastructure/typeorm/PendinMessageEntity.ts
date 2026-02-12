import { EntitySchema } from "typeorm";
import { PendingMessage } from "../../domain/PendingMessages";

export const PendingMessageEntity = new EntitySchema<PendingMessage>({
  name: "PendingMessage",
  tableName: "pending_messages",
  target: PendingMessage,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    company_id: {
      type: Number,
      nullable: false,
    },
    phone_number: {
      type: String,
      nullable: false,
    },
    message: {
      type: String,
      nullable: false,
    },
    type: {
      type: String,
      nullable: false,
    },
    status: {
      type: String,
      nullable: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    from_number: {
      type: String,
      nullable: true,
    },
    scheduled_at: { 
      type: Date, 
      nullable: true 
    },
  },
  relations: {
    company: {
      target: "Company",
      type: "many-to-one",
      joinColumn: {
        name: "company_id",
      },
      inverseSide: "pendingMessages",
    },
  }
});
