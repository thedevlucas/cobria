import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentType {
  SUBSCRIPTION = "subscription",
  USAGE = "usage",
  AGENT_RENTAL = "agent_rental",
  OVERAGE = "overage",
}

export class Payment extends AggregateRoot {
  id!: number;
  companyId: number;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  description: string;
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: string;
  subscriptionId?: number;
  agentId?: number;
  periodStart?: Date;
  periodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    companyId: number,
    amount: number,
    currency: string,
    type: PaymentType,
    status: PaymentStatus,
    description: string,
    paymentMethod: string,
    transactionId?: string,
    gatewayResponse?: string,
    subscriptionId?: number,
    agentId?: number,
    periodStart?: Date,
    periodEnd?: Date
  ) {
    super();
    this.companyId = companyId;
    this.amount = amount;
    this.currency = currency;
    this.type = type;
    this.status = status;
    this.description = description;
    this.paymentMethod = paymentMethod;
    this.transactionId = transactionId;
    this.gatewayResponse = gatewayResponse;
    this.subscriptionId = subscriptionId;
    this.agentId = agentId;
    this.periodStart = periodStart;
    this.periodEnd = periodEnd;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    companyId: number;
    amount: number;
    currency: string;
    type: PaymentType;
    status: PaymentStatus;
    description: string;
    paymentMethod: string;
    transactionId?: string;
    gatewayResponse?: string;
    subscriptionId?: number;
    agentId?: number;
    periodStart?: Date;
    periodEnd?: Date;
  }): Payment {
    return new Payment(
      params.companyId,
      params.amount,
      params.currency,
      params.type,
      params.status,
      params.description,
      params.paymentMethod,
      params.transactionId,
      params.gatewayResponse,
      params.subscriptionId,
      params.agentId,
      params.periodStart,
      params.periodEnd
    );
  }

  markAsCompleted(transactionId: string, gatewayResponse: string): void {
    this.status = PaymentStatus.COMPLETED;
    this.transactionId = transactionId;
    this.gatewayResponse = gatewayResponse;
    this.updatedAt = new Date();
  }

  markAsFailed(gatewayResponse: string): void {
    this.status = PaymentStatus.FAILED;
    this.gatewayResponse = gatewayResponse;
    this.updatedAt = new Date();
  }

  markAsCancelled(): void {
    this.status = PaymentStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  markAsRefunded(): void {
    this.status = PaymentStatus.REFUNDED;
    this.updatedAt = new Date();
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  toPrimitives(): any {
    return {
      id: this.id,
      companyId: this.companyId,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      status: this.status,
      description: this.description,
      paymentMethod: this.paymentMethod,
      transactionId: this.transactionId,
      gatewayResponse: this.gatewayResponse,
      subscriptionId: this.subscriptionId,
      agentId: this.agentId,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
