import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const PendingMessage = database.define(
  "pending_messages", 
  {
    id: {
      type: DataTypes.INTEGER, 
      autoIncrement: true,
      primaryKey: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user", 
        key: "id",
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending",
    },
    from_number: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize: database,
    tableName: "pending_messages", 
    timestamps: false, 
  }
);