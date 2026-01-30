import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const Stage = database.define(
  "stage",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    id_user: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "primary",
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  },
  { 
    tableName: "stage",
    timestamps: true 
  }
);