export enum TicketStatus {
  OPENED = "OPENED",
  REVIEWING = "REVIEWING",
  CLOSED = "CLOSED",
}

export enum TicketType {
  SUPPORT = "SUPPORT",
  REQUEST_AGENTS = "REQUEST_AGENTS",
}

export class Ticket {
  id!: number;
  idCompany: number;
  subject: string;
  message: string;
  status: TicketStatus;
  type: TicketType;
  createdAt?: string;
  updatedAt?: string;

  constructor(
    idCompany: number,
    subject: string,
    message: string,
    type: TicketType,
    status: TicketStatus = TicketStatus.OPENED,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  ) {
    this.idCompany = idCompany;
    this.subject = subject;
    this.message = message;
    this.status = status;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: {
    idCompany: number;
    subject: string;
    message: string;
    type: TicketType;
  }) {
    return new Ticket(
      params.idCompany,
      params.subject,
      params.message,
      params.type
    );
  }

  static fromPrimitives(params: {
    idCompany: number;
    subject: string;
    message: string;
    type: TicketType;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
  }) {
    return new Ticket(
      params.idCompany,
      params.subject,
      params.message,
      params.type,
      params.status,
      params.createdAt,
      params.updatedAt
    );
  }

  close() {
    this.status = TicketStatus.CLOSED;
  }

  toPrimitives() {
    return {
      idCompany: this.idCompany,
      subject: this.subject,
      message: this.message,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
