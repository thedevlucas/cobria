import { Company } from "../Company";
import { CompanyRepository } from "../CompanyRepository";

export class CompanyExistById {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { companyId: number }): Promise<Company | null> {
    const company = await this.companyRepository.findById(params.companyId);

    return company;
  }
}
