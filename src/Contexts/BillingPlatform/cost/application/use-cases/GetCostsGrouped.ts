import { CostRepository } from "../../domain/CostRepository";

export class GetCostsGrouped {
  constructor(private readonly costRepository: CostRepository) {}

  async run(): Promise<any> {
    return await this.costRepository.findGroupedByType();
  }
}
