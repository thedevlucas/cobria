import { CompanyRepository } from "../../domain/CompanyRepository";

export class GetAgentsAssociatedWithUser {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(): Promise<any> {
    return await this.companyRepository.findAgentsByUser();
  }
}
