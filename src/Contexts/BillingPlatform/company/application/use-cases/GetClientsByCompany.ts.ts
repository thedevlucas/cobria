import { CompanyRepository } from "../../domain/CompanyRepository";

export class GetClientsByCompany {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { companyId: number }) {
    const clients = await this.companyRepository.findClientsByCompanyId(
      params.companyId
    );

    if (clients === null) {
      throw new Error("No se encontro la compañia");
    }

    return clients;
  }
}
