import { EntitySchema } from "typeorm";
import { Telephone } from "../../domain/Telephone";

export const TelephoneEntity = new EntitySchema<Telephone>({
  name: "Telephone",
  tableName: "telephone",
  target: Telephone,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    from: {
      type: "bigint",
      nullable: false,
    },
    to: {
      type: "bigint",
      nullable: false,
    },
    id_debtor: {
      type: "bigint",
      nullable: false,
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
    debtor: {
      target: "Debtor",
      type: "many-to-one",
      joinColumn: {
        name: "id_debtor",
      },
      inverseSide: "telephones",
    },
  },
  indices: [
    {
      unique: true,
      columns: ["from", "to", "id_debtor"],
    },
  ],
});
