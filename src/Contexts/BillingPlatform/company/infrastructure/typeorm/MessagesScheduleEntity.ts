import { EntitySchema } from "typeorm";
import { MessagesSchedule } from "../../domain/MessagesSchedule";

export const MessagesScheduleEntity = new EntitySchema<MessagesSchedule>({
  name: "MessagesSchedule",
  tableName: "messages_schedule",
  target: MessagesSchedule,
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
    day_of_week: {
      type: Number,
      nullable: false,
    },
    start_time: {
      type: String,
      nullable: false,
    },
    end_time: {
      type: String,
      nullable: false,
    },
    timezone: {
      type: String,
      nullable: false,
    },
    createdAt: {
      type: Date,
      nullable: false,
      default: new Date(),
    },
    updatedAt: {
      type: Date,
      nullable: false,
      default: new Date(),
    },
  },
  relations: {
    company: {
      target: "Company",
      type: "many-to-one",
      joinColumn: {
        name: "company_id",
      },
      inverseSide: "schedules",
    },
  },
});
