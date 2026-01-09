// Dependencies
import { z } from "zod";
// Validator
import { validate } from "../helpers/Validator";
import { Role } from "../Contexts/BillingPlatform/company/domain/Company";

// Interfaces
export interface registerInterface {
  name: string;
  password: string;
  email: string;
  isCollectionCompany: boolean;
}

export interface createUserInterface extends registerInterface {
  role: Role;
  active: boolean;
  cellphone?: number;
  telephone?: number;
}

export interface modifyUserInterface {
  name: string;
  password?: string;
  email: string;
  role: Role;
  active: boolean;
  cellphone?: number;
  telephone?: number;
}

// Schema
export const roleSchema = ["superadmin", "admin", "user"];
export const emailSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

const passwordSchema = z
  .object({
    password: z.string().min(6),
  })
  .strict();

const loginSchema = z
  .object({})
  .merge(emailSchema)
  .merge(passwordSchema)
  .strict();

const registerSchema = z
  .object({
    name: z.string().min(1),
    isCollectionCompany: z.boolean(),
    companyName: z.string().min(1),
  })
  .merge(emailSchema)
  .merge(passwordSchema)
  .strict();

const createUserSchema = z
  .object({
    role: z.enum(roleSchema as [string, ...string[]]),
    active: z.boolean(),
    cellphone: z.number().min(2).nullable().optional(),
    telephone: z.number().min(2).nullable().optional(),
  })
  .merge(registerSchema)
  .strict();

const modifyUserSchema = z
  .object({
    name: z.string().min(1),
    password: z.string().min(6).nullable().optional(),
    role: z.enum(roleSchema as [string, ...string[]]),
    active: z.boolean(),
    cellphone: z.number().min(2).nullable().optional(),
    telephone: z.number().min(2).nullable().optional(),
  })
  .merge(emailSchema)
  .strict();

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6),
  })
  .strict();

// Validator
export const emailValidator = validate(emailSchema, "body");
export const passwordValidator = validate(passwordSchema, "body");
export const loginValidator = validate(loginSchema, "body");
export const registerValidator = validate(registerSchema, "body");
export const createUserValidator = validate(createUserSchema, "body");
export const modifyUserValidator = validate(modifyUserSchema, "body");
export const changePasswordValidator = validate(changePasswordSchema, "body");
