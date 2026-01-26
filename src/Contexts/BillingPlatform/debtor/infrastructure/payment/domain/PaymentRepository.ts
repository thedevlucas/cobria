import { Payment, PaymentStatus, PaymentType } from "./Payment";

export interface PaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  findByCompanyId(companyId: number): Promise<Payment[]>;
  findByStatus(status: PaymentStatus): Promise<Payment[]>;
  findByType(type: PaymentType): Promise<Payment[]>;
  findBySubscriptionId(subscriptionId: number): Promise<Payment[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]>;
  update(payment: Payment): Promise<void>;
  delete(id: number): Promise<void>;
}
