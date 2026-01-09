import { EntitySchema } from "typeorm";
import { Client } from "../../domain/Client";

export const ClientEntity = new EntitySchema<Client>({
  name: "Client",
  tableName: "client",
  target: Client,
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
    activity: {
      type: String,
      nullable: false,
    },
    address: {
      type: String,
      nullable: false,
    },
    service: {
      type: String,
      nullable: false,
    },
    segment: {
      type: String,
      nullable: false,
    },
    phone: {
      type: String,
      nullable: true,
    },
    id_company: {
      type: Number,
      nullable: false,
    },
    createdAt: {
      type: Date,
      nullable: false,
      createDate: true,
    },
    updatedAt: {
      type: Date,
      nullable: false,
      updateDate: true,
    },
  },
  relations: {
    company: {
      target: "Company",
      type: "many-to-one",
      joinColumn: {
        name: "id_company",
      },
      inverseSide: "clients",
    },
  },
});
