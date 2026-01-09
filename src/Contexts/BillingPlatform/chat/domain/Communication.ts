import { Client } from "../../company/domain/Client";

export interface Communication {
  makePhoneCall(params: {
    from: string;
    to: string;
    message: string;
    idUser: number;
  }): Promise<void>;
  sendFirstMessage(params: {
    idUser: number;
    companyName?: string;
    from: string;
    to: string;
    debtorName: string;
    client?: Client | null;
  }): Promise<{ cost: number; message: string }>;
  sendWhatsappMessage(params: {
    idUser: number;
    from: string;
    to: string;
    message: string;
  }): Promise<{ cost: string }>;
  sendSmsMessage(params: {
    idUser: number;
    from: string;
    to: string;
    message: string;
  }): Promise<{ cost: number; message: string }>;
  sendEmailMessage(params: {
    idUser: number;
    from: string;
    to: string;
    subject: string;
    message: string;
  }): Promise<{ cost: number; message: string }>;
  answerCallMessage(params: { message: string }): Promise<string>;
}
