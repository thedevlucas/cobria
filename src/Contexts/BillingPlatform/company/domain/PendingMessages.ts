import { Company } from "./Company";

export enum PendingMessageType {
  WHATSAPP = "whatsapp",
  CALL = "call",
  SMS = "sms",
  EMAIL = "email",
}

export enum PendingMessageStatus {
  PENDING = "pending",
  SENT = "sent",
  ERROR = "error",
}

export class PendingMessage {
  id!: number;
  company_id: number;
  phone_number: string;
  from_number: string;
  message: string;
  type: PendingMessageType;
  status: PendingMessageStatus;
  attempts: number;
  scheduled_at: Date;
  company!: Company;

  constructor(
    company_id: number,
    phone_number: string,
    message: string,
    type: PendingMessageType,
    status: PendingMessageStatus,
    from_number: string,
    attempts: number = 0,
    scheduled_at: Date = new Date()
  ) {
    this.company_id = company_id;
    this.phone_number = phone_number;
    this.message = message;
    this.type = type;
    this.status = status;
    this.from_number = from_number;
    this.attempts = attempts;
    this.scheduled_at = scheduled_at;
  }

  static create(params: {
    companyId: number;
    phoneNumber: string;
    message: string;
    type: PendingMessageType;
    fromNumber: string;
    scheduledAt?: Date; 
  }): PendingMessage {
    return new PendingMessage(
      params.companyId,
      params.phoneNumber,
      params.message,
      params.type,
      PendingMessageStatus.PENDING,
      params.fromNumber,
      0,
      params.scheduledAt || new Date()
    );
  }

  static fromPrimitives(plainData: any) {
      const msg = new PendingMessage(
        plainData.companyId,
        plainData.phoneNumber,
        plainData.message,
        plainData.type,
        plainData.status,
        plainData.fromNumber,
        plainData.attempts || 0,
        plainData.scheduled_at ? new Date(plainData.scheduled_at) : new Date()
      );
      if (plainData.id) msg.id = plainData.id;
      return msg;
  }

  toPrimitives() {
    return {
      id: this.id,
      company_id: this.company_id,
      phone_number: this.phone_number,
      message: this.message,
      type: this.type,
      status: this.status,
      from_number: this.from_number,
      attempts: this.attempts,
    };
  }
}