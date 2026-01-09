// Credentials
import { account_sid, auth_token_twilio } from "./Constants";

export const twillioClient = require("twilio")(account_sid, auth_token_twilio);

export enum TWILIO_WHATSAPP_TEMPLATES {
  GREETINGS_MESSAGE = "HX516a3897c652b4c80d6a21b8e2445608",
  GREETINGS_MESSAGE_WITH_CLIENT = "HX2a4569d34e799334c9ed031a666bc84c",
}
