import { CompanyRepository } from "../CompanyRepository";

export class CompanyExistByEmailOrName {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { email: string; name: string }): Promise<boolean> {
    const companyByEmail = await this.companyRepository.findByEmail(
      params.email
    );
    const companyByName = await this.companyRepository.findByName(params.name);

    return !!companyByEmail || !!companyByName;
  }
}
