// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";
import {
  TicketStatus,
  TicketType,
} from "../Contexts/BillingPlatform/company/domain/Ticket";
// Enums

// Ticket Model Definition
export const Ticket = database.define(
  "ticket",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    idCompany: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "company",
        key: "id",
      },
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: Object.values(TicketStatus),
      defaultValue: TicketStatus.OPENED,
    },
    type: {
      type: DataTypes.ENUM,
      values: Object.values(TicketType),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: database,
    tableName: "ticket",
  }
);
