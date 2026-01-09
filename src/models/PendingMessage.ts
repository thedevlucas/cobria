import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const PendingMessage = database.define(
  "pending_message",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "company",
        key: "id",
      },
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user",
        key: "id"
      }
    },
    phone_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    from_number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("whatsapp", "call", "sms", "email"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "sent", "error"),
      allowNull: false,
      defaultValue: "pending",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: database,
    tableName: "pending_message",
  }
);
