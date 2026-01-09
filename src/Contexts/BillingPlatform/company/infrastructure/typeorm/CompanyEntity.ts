import { EntitySchema } from "typeorm";
import { Company } from "../../domain/Company";

export const CompanyEntity = new EntitySchema<Company>({
  name: "Company",
  tableName: "user",
  target: Company,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
      unique: true,
    },
    password: {
      type: String,
      nullable: false,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
      nullable: false,
    },
    email: {
      type: String,
      nullable: false,
      unique: true,
    },
    active: {
      type: Boolean,
      nullable: false,
      default: true,
    },
    cellphone: {
      type: Number,
      nullable: true,
    },
    telephone: {
      type: Number,
      nullable: true,
    },
    isCollectionCompany: {
      type: Boolean,
      nullable: false,
      default: false,
    },
    companyName: {
      type: String,
      nullable: true,
      name: "company_name",
    },
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    clients: {
      target: "Client",
      type: "one-to-many",
      joinColumn: true,
      inverseSide: "company",
      cascade: true,
      onUpdate: "CASCADE",
    },
    schedules: {
      target: "MessagesSchedule",
      type: "one-to-many",
      joinColumn: true,
      inverseSide: "company",
      cascade: true,
    },
    pendingMessages: {
      target: "PendingMessage",
      type: "one-to-many",
      joinColumn: true,
      inverseSide: "company",
      cascade: true,
    },
  },
});
