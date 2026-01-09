import { EntitySchema } from "typeorm";
import { Ticket } from "../../domain/Ticket";

export const TicketEntity = new EntitySchema<Ticket>({
  name: "Ticket",
  tableName: "ticket",
  target: Ticket,
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    idCompany: {
      type: Number,
      name: "idcompany",
    },
    subject: {
      type: String,
    },
    type: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      default: "OPENED",
    },
    createdAt: {
      type: String,
      createDate: true,
      name: "createdat",
    },
    updatedAt: {
      type: String,
      updateDate: true,
      name: "updatedat",
    },
  },
});
