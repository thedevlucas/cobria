// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";
// Schemas
import { roleSchema } from "../schemas/UserSchema";

export const User = database.define(
  "user",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      values: roleSchema,
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
    },
    telephone: {
      type: DataTypes.BIGINT,
      allowNull: true,
      unique: true,
    },
    isCollectionCompany: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'company_name' 
    },
  },
  {
    sequelize: database,
    tableName: "user",
  }
);