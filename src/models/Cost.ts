import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const Cost = database.define(
  "cost",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_company: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'idcompany',
      references: {
        model: "company",
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'iduser',
    },
    id_debtor: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'iddebtor',
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("whatsapp", "sms", "call", "email", "agent", "subscription", "bot_rental"),
      allowNull: false,
    },
    cost_type: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'costtype',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'phonenumber',
    },
    status: {
      type: DataTypes.ENUM("pending", "processed", "failed"),
      allowNull: true,
      defaultValue: "processed",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'createdat'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updatedat'
    },
  },
  {
    sequelize: database,
    tableName: "cost",
    timestamps: true,
  }
);