// Dependencies
import { DataTypes } from "sequelize";
// Database
import { database } from "../config/Database";
// Schemas
import { debtImageSchema } from "../schemas/DebtImageSchema";

export const debtImages = database.define('debtor_images',{
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    id_debtor:{
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: 'debtor',
            key: 'id'
        }
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type:{
        type: DataTypes.ENUM,
        values: debtImageSchema,
        allowNull: false
    }
    
})