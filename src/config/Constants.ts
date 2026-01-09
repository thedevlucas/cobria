// Dependencies
import dotenv from "dotenv";
const { readFileSync } = require("fs");
const path = require("path");

dotenv.config();

// Port of the service
export const port = Number(process.env.PORT);

export const environment = process.env.NODE_ENV;

// Twillio credentials
export const account_sid = process.env.ACCOUNT_SID;
export const auth_token_twilio = process.env.AUTH_TOKEN_TWILLIO;
export const twilio_whatsapp_number = process.env.TWILIO_WHATSAPP_NUMBER;
// Database credentials
export const database_host = process.env.DATABASE_HOST;
export const database_name = process.env.DATABASE_NAME;
export const database_user = process.env.DATABASE_USER;
export const database_password = process.env.DATABASE_PASSWORD;
export const database_port = Number(process.env.DATABASE_PORT);
export const endpoint_database = process.env.ENDPOINT_DATABASE;
export const database_url = process.env.DATABASE_URL;
// MongoDB url
export const mongo_url = process.env.MONGO_URL;
// Encryption credentials
export const crypt_algorithm = process.env.CRYPT_ALGORITHM;
export const crypt_key = process.env.CRYPT_KEY;
export const crypt_iv = process.env.CRYPT_IV;
// Email
export const email = process.env.EMAIL;
export const email_password = process.env.EMAIL_PASSWORD;
export const email_port = Number(process.env.EMAIL_PORT);
export const email_host = process.env.EMAIL_HOST;
// Password
export const password_salt = Number(process.env.PASSWORD_SALT);
// Token
export const jwt_key = process.env.JWT_KEY;
export const jwt_expires_in = process.env.JWT_EXPIRES_IN;
// Hosts
export const backend_host = process.env.BACKEND_HOST;
export const frontend_host = process.env.FRONTEND_HOST;
// LLM
export const bard_api_key = process.env.GEMINI_API_KEY;
// Gpt prompts
function gptPrompts(): string {
  const prompts = readFileSync(
    path.resolve(__dirname, "../static/json/GptPrompts.json"),
    "utf8",
    (error: any, data: any) => {
      if (error) {
        return "";
      }
      return data;
    }
  );
  return prompts;
}
export const gptPromptsJson = JSON.parse(gptPrompts());
// Excel
export function excelColumns(): string {
  const columns = readFileSync(
    path.resolve(__dirname, "../static/json/ExcelColumns.json"),
    "utf8",
    (error: any, data: any) => {
      if (error) {
        return "";
      }
      return data;
    }
  );
  return columns;
}
// Cellphone info
function getCellphoneInfo(): string {
  const info = readFileSync(
    path.resolve(__dirname, "../static/json/CellphoneInfo.json"),
    "utf8",
    (error: any, data: any) => {
      if (error) {
        return "";
      }
      return data;
    }
  );
  return info;
}
export const cellphoneInfo = JSON.parse(getCellphoneInfo());
// OCR config
function getOCRConfig(): string {
  const config = readFileSync(
    path.resolve(__dirname, "../static/json/OCRConfig.json"),
    "utf8",
    (error: any, data: any) => {
      if (error) {
        return "";
      }
      return data;
    }
  );
  return config;
}
export const ocrConfig = JSON.parse(getOCRConfig());
export const ocr_api_key = process.env.OCR_API_KEY;
// Payment info
function getPaymentInfo(): string {
  const info = readFileSync(
    path.resolve(__dirname, "../static/json/PaymentInfo.json"),
    "utf8",
    (error: any, data: any) => {
      if (error) {
        return "";
      }
      return data;
    }
  );
  return info;
}
export const paymentInfo = JSON.parse(getPaymentInfo());

export const EMAIL_TO_SEND_TICKETS = "luis-fernando-10@outlook.es";
