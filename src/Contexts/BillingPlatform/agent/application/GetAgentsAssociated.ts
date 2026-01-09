import { AgentRepository } from "../domain/AgentRepository";

export class GetAgentsAssociated {
  constructor(private readonly agentRepository: AgentRepository) {}

  async run(): Promise<any> {
    return await this.agentRepository.findGroupedByUser();
  }
}
