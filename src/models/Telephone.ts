// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";

export const Telephone = database.define(
  "telephone",
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
    id_debtor: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "debtor",
        key: "id",
      },
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["from", "to", "id_debtor"],
      },
    ],
    tableName: "telephone",
  }
);
