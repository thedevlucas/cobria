import { Cost, CostType } from "../../domain/Cost";
import { CostRepository } from "../../domain/CostRepository";

export class AddCost {
  constructor(private readonly costRepository: CostRepository) {}

  async run(params: { idCompany: number; amount: number; type: CostType }) {
    const cost = Cost.create({
      idCompany: params.idCompany,
      amount: params.amount,
      type: params.type,
    });

    await this.costRepository.save(cost);
  }
}
