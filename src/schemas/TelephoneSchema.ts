// Dependencies
import { z } from "zod";
// Validator
import { validate } from "../helpers/Validator";
// Other schemas
import { documentDebtorSchema } from "./DebtorSchema";

// Interfaces
export interface telephoneInterface {
  from: number;
  to: number;
  document: number;
}

// Schema
export const telephoneSchema = z
  .object({
    from: z.number().min(2),
    to: z.number().min(2),
  })
  .merge(documentDebtorSchema)
  .strict();

// Validator
export const telephoneValidator = validate(telephoneSchema, "body");
