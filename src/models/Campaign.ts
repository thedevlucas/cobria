import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const Campaign = database.define(
  "campaign",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    id_user: { type: DataTypes.BIGINT, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    target_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'active' }, // active, paused, completed
  },
  { tableName: "campaign", timestamps: true }
);