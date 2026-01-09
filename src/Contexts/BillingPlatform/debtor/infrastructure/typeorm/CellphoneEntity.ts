import { EntitySchema } from "typeorm";
import { Cellphone } from "../../domain/Cellphone";

export const CellphoneEntity = new EntitySchema<Cellphone>({
  name: "Cellphone",
  tableName: "cellphone",
  target: Cellphone,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    from: {
      type: Number,
      nullable: false,
    },
    to: {
      type: Number,
      nullable: false,
    },
    id_debtor: {
      type: Number,
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
      inverseSide: "cellphones",
    },
  },
  indices: [
    {
      unique: true,
      columns: ["from", "to", "id_debtor"],
    },
  ],
});
