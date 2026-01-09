import { Subscription } from "./Subscription";

export interface SubscriptionRepository {
  save(subscription: Subscription): Promise<Subscription>;
  findById(id: number): Promise<Subscription | null>;
  findByCompanyId(companyId: number): Promise<Subscription | null>;
  findByStatus(status: string): Promise<Subscription[]>;
  update(subscription: Subscription): Promise<void>;
  delete(id: number): Promise<void>;
}
