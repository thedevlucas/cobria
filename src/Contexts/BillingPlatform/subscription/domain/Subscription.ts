import { AggregateRoot } from "../../../Shared/domain/AggregateRoot";

export enum SubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  PENDING = "pending",
}

export enum SubscriptionPlan {
  BASIC = "basic",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

export class Subscription extends AggregateRoot {
  id!: number;
  companyId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  monthlyPrice: number;
  features: string[];
  maxDebtors: number;
  maxAgents: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    companyId: number,
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
    startDate: Date,
    endDate: Date,
    monthlyPrice: number,
    features: string[],
    maxDebtors: number,
    maxAgents: number
  ) {
    super();
    this.companyId = companyId;
    this.plan = plan;
    this.status = status;
    this.startDate = startDate;
    this.endDate = endDate;
    this.monthlyPrice = monthlyPrice;
    this.features = features;
    this.maxDebtors = maxDebtors;
    this.maxAgents = maxAgents;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static create(params: {
    companyId: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    monthlyPrice: number;
    features: string[];
    maxDebtors: number;
    maxAgents: number;
  }): Subscription {
    return new Subscription(
      params.companyId,
      params.plan,
      params.status,
      params.startDate,
      params.endDate,
      params.monthlyPrice,
      params.features,
      params.maxDebtors,
      params.maxAgents
    );
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && this.endDate > new Date();
  }

  isExpired(): boolean {
    return this.endDate <= new Date();
  }

  canAddDebtors(currentCount: number): boolean {
    return currentCount < this.maxDebtors;
  }

  canAddAgents(currentCount: number): boolean {
    return currentCount < this.maxAgents;
  }

  hasFeature(feature: string): boolean {
    return this.features.includes(feature);
  }

  updateStatus(status: SubscriptionStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  extendSubscription(months: number): void {
    const newEndDate = new Date(this.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);
    this.endDate = newEndDate;
    this.updatedAt = new Date();
  }

  toPrimitives(): any {
    return {
      id: this.id,
      companyId: this.companyId,
      plan: this.plan,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      monthlyPrice: this.monthlyPrice,
      features: this.features,
      maxDebtors: this.maxDebtors,
      maxAgents: this.maxAgents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
