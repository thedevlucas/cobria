import { EntitySchema } from "typeorm";
import { Debtor, PaymentStatus } from "../../domain/Debtor";

export const DebtorEntity = new EntitySchema<Debtor>({
  name: "Debtor",
  tableName: "debtor",
  target: Debtor,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    id_user: {
      type: Number,
      nullable: false,
    },
    name: {
      type: String,
      nullable: false,
    },
    document: {
      type: Number,
      nullable: false,
    },
    email: {
      type: String,
      nullable: true,
    },
    paid: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.NO_CONTACT,
      nullable: false,
    },
    events: {
      type: String,
      nullable: true,
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
    telephones: {
      target: "Telephone",
      type: "one-to-many",
      joinColumn: true,
      inverseSide: "debtor",
      cascade: true,
    },
    cellphones: {
      target: "Cellphone",
      type: "one-to-many",
      joinColumn: true,
      inverseSide: "debtor",
      cascade: true,
    },
  },
  indices: [
    {
      unique: true,
      columns: ["document", "id_user"],
    },
  ],
});
