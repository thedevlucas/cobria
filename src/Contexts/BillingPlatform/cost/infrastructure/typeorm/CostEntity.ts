import { EntitySchema } from "typeorm";
import { Cost } from "../../domain/Cost";

export const CostEntity = new EntitySchema<Cost>({
  name: "Cost",
  tableName: "cost",
  target: Cost,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    idCompany: {
      type: Number,
      nullable: false,
      name: "idcompany",
    },
    amount: {
      type: Number,
      nullable: false,
    },
    type: {
      type: String,
      nullable: false,
    },
    createdAt: {
      type: Date,
      nullable: false,
      name: "createdat",
    },
    updatedAt: {
      type: Date,
      nullable: false,
      name: "updatedat",
    },
  },
});
