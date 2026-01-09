import { Agent } from "./Agent";

export interface AgentRepository {
  save(agent: Agent): Promise<void>;
  findById(id: number): Promise<Agent | null>;
  findByIdCompany(idCompany: number): Promise<Agent[]>;
  findByPhoneNumber(phoneNumber: string): Promise<Agent | null>;
  findGroupedByUser(): Promise<any[]>;
}
