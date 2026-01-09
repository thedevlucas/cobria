// Dependencies
import { z } from "zod";
// Validator
import { validate } from "../helpers/Validator";
// External schemas
import { emailSchema } from "./UserSchema";
import { PaymentStatus } from "../Contexts/BillingPlatform/debtor/domain/Debtor";

// Interface
export interface createDebtorInterface {
  name: string;
  document: number;
  email: string;
  debtDate?: Date;
}

export interface modifyDebtorInterface extends createDebtorInterface {
  paid: PaymentStatus;
}

// Schemas
export const paidSchema = [
  "No contact",
  "Contact",
  "Not paid",
  "Added",
  "Paid",
];
export const documentDebtorSchema = z
  .object({
    document: z.number().min(1),
  })
  .strict();

const createDebtorSchema = z
  .object({
    name: z.string().min(1),
    paid: z.string().optional(),
    email: z.string().email().optional(), // Email is optional for debtor contact
  })
  .merge(documentDebtorSchema)
  .strict();

const modifyDebtorSchema = z
  .object({
    paid: z.string(),
  })
  .merge(createDebtorSchema)
  .strict();

// Validator
export const createDebtorValidator = validate(createDebtorSchema, "body");
export const modifyDebtorValidator = validate(modifyDebtorSchema, "body");
