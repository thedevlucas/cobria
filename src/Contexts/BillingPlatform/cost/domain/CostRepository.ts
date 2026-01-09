import { Cost, CostType } from "./Cost";

export interface CostRepository {
  save(cost: Cost): Promise<void>;
  findByType(type: CostType): Promise<any>;
  findCostsByCompany(idCompany: number): Promise<Cost[]>;
  findGroupedByType(): Promise<
    {
      type: CostType;
      idcompany: number;
      amount: number;
    }[]
  >;
}
