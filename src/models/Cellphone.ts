// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";

export const Cellphone = database.define(
  "cellphone",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    from: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    to: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    number: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    id_debtor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "debtor",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["id_debtor"],
      },
      {
        unique: true,
        fields: ["number", "id_debtor"],
      },
    ],
    tableName: "cellphone",
    timestamps: true,
  }
);