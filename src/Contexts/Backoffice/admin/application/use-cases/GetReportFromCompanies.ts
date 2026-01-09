import { CostRepository } from "../../../../BillingPlatform/cost/domain/CostRepository";
import { Debtor } from "../../../../BillingPlatform/debtor/domain/Debtor";
import { DebtorRepository } from "../../../../BillingPlatform/debtor/domain/DebtorRepository";

export class GetReportFromCompanies {
  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly costRepository: CostRepository
  ) {}

  async run(): Promise<any> {
    const costs = await this.costRepository.findGroupedByType();
    let debtors: Debtor[] = [];

    for (const cost of costs) {
      const debtorsByCompany = await this.debtorRepository.findByCompany(
        cost.idcompany
      );

      if (debtorsByCompany?.length) {
        debtors.push(...debtorsByCompany);
      }
    }

    return {
      debtors,
      costs,
    };
  }
}
