import { Agent } from "../../../../BillingPlatform/agent/domain/Agent";
import { AgentRepository } from "../../../../BillingPlatform/agent/domain/AgentRepository";
import { CompanyRepository } from "../../../../BillingPlatform/company/domain/CompanyRepository";
import { Cost, CostType } from "../../../../BillingPlatform/cost/domain/Cost";
import { CostRepository } from "../../../../BillingPlatform/cost/domain/CostRepository";

export class SetAgentToCompany {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly agentRepository: AgentRepository,
    private readonly costRepository: CostRepository
  ) {}

  async run(params: {
    idCompany: number;
    name: string;
    phone: string;
    monthsToExpire: number;
    price: number;
  }): Promise<void> {
    const company = await this.companyRepository.findById(params.idCompany);

    if (!company) {
      throw new Error("Company not found");
    }

    const isAlreadyUsedNumber = await this.agentRepository.findByPhoneNumber(
      params.phone
    );
    if (isAlreadyUsedNumber) {
      throw new Error("The Phone number is used already.");
    }

    const agent = Agent.create({
      idCompany: company.id,
      name: params.name,
      phone: params.phone,
      monthsToExpire: params.monthsToExpire,
      price: params.price,
    });

    const cost = Cost.create({
      idCompany: company.id,
      amount: params.price * params.monthsToExpire,
      type: CostType.AGENT,
    });

    await Promise.all([
      this.agentRepository.save(agent),
      this.costRepository.save(cost),
    ]);
  }
}
