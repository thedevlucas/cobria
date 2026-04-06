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
    email: z.string().email("El correo electrónico no es válido"),
  })
  .strict();

const passwordSchema = z
  .object({
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  })
  .strict();

const loginSchema = z
  .object({})
  .merge(emailSchema)
  .merge(passwordSchema)
  .strict();

const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    isCollectionCompany: z.boolean({
        invalid_type_error: "Debe indicar si es una empresa de cobranza"
    }),
    companyName: z.string().min(1, "El nombre de la empresa es obligatorio"),
    cellphone: z.number().min(7, "El celular debe ser válido").optional(),
    telephone: z.number().min(7, "El teléfono debe ser válido").optional(),
  })
  .merge(emailSchema)
  .merge(passwordSchema)
  .strict();

const createUserSchema = z
  .object({
    role: z.enum(roleSchema as [string, ...string[]], {
        errorMap: () => ({ message: "El rol seleccionado no es válido" })
    }),
    active: z.boolean({
        invalid_type_error: "El estado debe ser un valor booleano"
    }),
    cellphone: z.number().min(2, "El número de celular debe ser válido").nullable().optional(),
    telephone: z.number().min(2, "El número de teléfono debe ser válido").nullable().optional(),
  })
  .merge(registerSchema)
  .strict();

const modifyUserSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").nullable().optional(),
    role: z.enum(roleSchema as [string, ...string[]], {
        errorMap: () => ({ message: "El rol seleccionado no es válido" })
    }),
    active: z.boolean({
        invalid_type_error: "El estado debe ser un valor booleano"
    }),
    cellphone: z.number().min(2, "El número de celular debe ser válido").nullable().optional(),
    telephone: z.number().min(2, "El número de teléfono debe ser válido").nullable().optional(),
  })
  .merge(emailSchema)
  .strict();

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "La contraseña actual debe tener al menos 6 caracteres"),
    newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
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
