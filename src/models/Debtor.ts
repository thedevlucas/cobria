// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";
// Schema
import { paidSchema } from "../schemas/DebtorSchema";

export const Debtor = database.define(
  "debtor",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "user",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    document: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    events: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paid: {
      type: DataTypes.STRING,
      values: paidSchema,
      defaultValue: "No contact",
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["document", "id_user"],
      },
    ],
    tableName: "debtor",
  }
);
