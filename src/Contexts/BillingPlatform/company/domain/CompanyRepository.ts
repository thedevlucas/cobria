import { Client } from "./Client";
import { Company } from "./Company";
import { MessagesSchedule } from "./MessagesSchedule";
import { PendingMessage } from "./PendingMessages";

export interface CompanyRepository {
  findById(id: number): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
  findByEmail(email: string): Promise<Company | null>;
  save(company: Company): Promise<void>;
  saveAndReturn(company: Company): Promise<Company>;
  findClientsByCompanyId(companyId: number): Promise<Client[] | null>;
  removeClient(client: Client): Promise<void>;
  removeMessagesSchedule(companyId: number): Promise<any>;
  listMessageSchedule(companyId: number): Promise<MessagesSchedule[]>;
  findClientById(clientId: number): Promise<Client | null>;
  addPendingMesage(pendingMessage: PendingMessage): Promise<void>;
  findAgentsByUser(): Promise<any[]>;
}
