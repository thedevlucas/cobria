// Dependencies
import { z } from "zod";
// Validator
import { validate } from "../helpers/Validator";

// Interfaces
export interface cellphoneInterface {
  number: number;
  id_debtor: number;
  country_code?: string;
  phone_type?: string;
  notes?: string;
  document?: number;
}

// Schema
export const cellphoneSchema = z
  .object({

    number: z.coerce.number({
      required_error: "El número es requerido",
      invalid_type_error: "El número debe ser numérico"
    }).min(5, "El número es muy corto"),

    id_debtor: z.coerce.number({
      required_error: "El ID del deudor es requerido",
      invalid_type_error: "El ID del deudor debe ser numérico"
    }),

    country_code: z.string().optional(),
    phone_type: z.string().optional(),
    notes: z.string().optional(),
    
    document: z.any().optional(),

    cellphone: z.any().optional(),
    debtor_id: z.any().optional()
  });

// Validator
export const cellphoneValidator = validate(cellphoneSchema, "body");