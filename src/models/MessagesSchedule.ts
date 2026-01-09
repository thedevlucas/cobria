import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const MessagesSchedule = database.define(
  "messages_schedule",
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
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
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
    tableName: "messages_schedule",
  }
);
