// Dependencies
import { z } from "zod";
// Validator
import { validate } from "../helpers/Validator";

// Interfaces
export interface ChatInterface {
  id_user?: number;
  from_cellphone: number;
  to_cellphone: number;
  message: string;
  image?: Buffer;
  image_type?: string;
  status?: boolean;
}

// Schema
export const messageChatSchema = z
  .object({
    message: z.string().min(1),
  })
  .strict();

// Validator
export const messageChatValidator = validate(messageChatSchema, "body");
