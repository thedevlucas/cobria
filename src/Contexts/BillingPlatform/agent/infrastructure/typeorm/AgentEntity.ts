import { EntitySchema } from "typeorm";
import { Agent } from "../../domain/Agent";

export const AgentEntity = new EntitySchema<Agent>({
  name: "Agent",
  tableName: "agent",
  target: Agent,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    name: {
      type: String,
      nullable: false,
    },
    phone: {
      type: String,
      nullable: false,
    },
    idCompany: {
      type: Number,
      nullable: false,
      name: "idcompany",
    },
    price: {
      type: Number,
      nullable: false,
    },
    monthsToExpire: {
      type: Number,
      nullable: false,
      name: "months_to_expire",
    },
    expireAt: {
      type: Date,
      nullable: false,
      name: "expire_at",
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
