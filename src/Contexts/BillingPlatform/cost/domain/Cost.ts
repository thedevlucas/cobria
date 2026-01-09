import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export enum CostType {
  WHATSAPP = "whatsapp",
  SMS = "sms",
  CALL = "call",
  EMAIL = "email",
  AGENT = "agent",
}

export class Cost extends AggregateRoot {
  id!: number;
  idCompany: number;
  amount: number;
  type: CostType;
  createdAt?: string;
  updatedAt?: string;

  constructor(
    idCompany: number,
    amount: number,
    type: CostType,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  ) {
    super();
    this.idCompany = idCompany;
    this.amount = amount;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(params: { idCompany: number; amount: number; type: CostType }) {
    return new Cost(params.idCompany, params.amount, params.type);
  }

  static fromPrimitives(params: {
    idCompany: number;
    amount: number;
    type: CostType;
    createdAt: string;
    updatedAt: string;
  }) {
    return new Cost(
      params.idCompany,
      params.amount,
      params.type,
      params.createdAt,
      params.updatedAt
    );
  }

  toPrimitives() {
    return {
      idCompany: this.idCompany,
      amount: this.amount,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
