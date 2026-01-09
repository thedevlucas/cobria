import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Company } from "../../domain/Company";
import { CompanyRepository } from "../../domain/CompanyRepository";
import { CompanyEntity } from "./CompanyEntity";
import { Client } from "../../domain/Client";
import { MessagesSchedule } from "../../domain/MessagesSchedule";
import { PendingMessage } from "../../domain/PendingMessages";

export class TypeOrmCompanyRepository
  extends TypeOrmRepository<Company>
  implements CompanyRepository
{
  protected entitySchema(): EntitySchema<Company> {
    return CompanyEntity;
  }

  async save(company: Company): Promise<void> {
    return this.persist(company);
  }

  async findById(id: number): Promise<Company | null> {
    const repository = await this.repository();
    return repository.findOne({
      where: { id },
      relations: ["clients", "schedules", "pendingMessages"],
    });
  }

  async findByName(name: string): Promise<Company | null> {
    const repository = await this.repository();
    return await repository.findOne({
      where: { name },
      relations: ["clients"],
    });
  }

  async findByEmail(email: string): Promise<Company | null> {
    const repository = await this.repository();
    return await repository.findOne({
      where: { email },
      relations: ["clients"],
    });
  }

  async saveAndReturn(company: Company): Promise<Company> {
    return this.persistAndReturn(company);
  }

  async findClientsByCompanyId(companyId: number): Promise<Client[] | null> {
    const repository = await this.repository();

    const company = await repository.findOne({
      where: { id: companyId },
      relations: ["clients"],
    });

    if (!company) {
      return null;
    }

    return company.clients;
  }

  async removeClient(client: Client): Promise<void> {
    const repository = await this.repository();

    await repository.manager.remove(client);
  }

  async removeMessagesSchedule(companyId: number): Promise<void> {
    const client = await this.client();
    await client.manager
      .createQueryBuilder()
      .delete()
      .from("messages_schedule")
      .where("company_id = :companyId", { companyId })
      .execute();
  }

  async listMessageSchedule(companyId: number): Promise<MessagesSchedule[]> {
    const client = await this.client();

    const schedules = await client.manager
      .createQueryBuilder()
      .select()
      .from("messages_schedule", "ms")
      .where("company_id = :companyId", { companyId })
      .execute();

    return schedules as MessagesSchedule[];
  }

  async findClientById(clientId: number): Promise<Client | null> {
    const client = await this.client();

    const clientFound = await client.manager
      .createQueryBuilder(Client, "client")
      .innerJoin("client.company", "company")
      .where("client.id = :clientId", { clientId })
      .getOne();

    return clientFound;
  }

  async addPendingMesage(pendingMessage: PendingMessage): Promise<void> {
    const repository = await this.repository();

    const company = await repository.findOne({
      where: { id: pendingMessage.company_id },
      relations: ["pendingMessages"],
    });

    if (!company) {
      return;
    }

    company.addPendingMessage(pendingMessage);

    await repository.save(company);
  }

  async findAgentsByUser(): Promise<any[]> {
    const client = await this.client();

    const rawData = await client.manager
      .createQueryBuilder(CompanyEntity, "user")
      .select("user.id", "id")
      .addSelect("user.name", "user_name")
      .addSelect("user.email", "user_email")
      .addSelect("agent.name", "agent_name")
      .addSelect("agent.phone", "phone")
      .addSelect("agent.months_to_expire", "expire")
      .addSelect("agent.expire_at", "expire_at")
      .leftJoin("agent", "agent", "user.id = agent.idcompany")
      .orderBy("user.id", "ASC")
      .getRawMany<{
        id: number;
        user_name: string;
        user_email: string;
        agent_name: string;
        phone: string;
        expire: number;
        expire_at: string;
      }>();

    const userMap = new Map<number, any>();

    rawData.forEach((item) => {
      if (!userMap.has(item.id)) {
        userMap.set(item.id, {
          id: item.id,
          user_name: item.user_name,
          user_email: item.user_email,
          agents: [],
        });
      }

      if (item.agent_name) {
        userMap.get(item.id).agents.push({
          agent_name: item.agent_name,
          phone: item.phone,
          expire: item.expire,
          expire_at: item.expire_at,
        });
      }
    });

    return Array.from(userMap.values());
  }
}
