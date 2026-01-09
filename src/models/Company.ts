import { DataTypes } from "sequelize";
import { database } from "../config/Database";

export const Company = database.define(
  "company",
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ["superadmin", "admin", "user"],
      defaultValue: "user",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    cellphone: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: true,
    },
    telephone: {
      type: DataTypes.BIGINT,
      unique: true,
      allowNull: true,
    },
    isCollectionCompany: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "company",
    timestamps: true,
  }
);