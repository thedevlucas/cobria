import { AgentRepository } from "../../../agent/domain/AgentRepository";
import { CompanyRepository } from "../../domain/CompanyRepository";

export class ListMyAgents {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly agentRepository: AgentRepository
  ) {}

  async run(params: { idCompany: number }) {
    const { idCompany } = params;
    const company = await this.companyRepository.findById(idCompany);

    if (!company) {
      throw new Error("Company not found");
    }

    const agents = await this.agentRepository.findByIdCompany(idCompany);

    return agents;
  }
}
