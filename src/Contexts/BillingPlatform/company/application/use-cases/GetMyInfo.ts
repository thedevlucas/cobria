import { CompanyRepository } from "../../domain/CompanyRepository";
import { CompanyNotFoundException } from "../../domain/exceptions/CompanyNotFound";

export class GetMyInfo {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { idCompany: number }) {
    const company = await this.companyRepository.findById(params.idCompany);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    return company;
  }
}
