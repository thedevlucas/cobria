import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const Agent = database.define(
  "agent",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    idCompany: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "company",
        key: "id",
      },
    },
    monthsToExpire: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
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
    tableName: "agent",
  }
);
