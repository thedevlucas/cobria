import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Agent } from "../../domain/Agent";
import { AgentRepository } from "../../domain/AgentRepository";
import { AgentEntity } from "./AgentEntity";

export class TypeOrmAgentRepository
  extends TypeOrmRepository<Agent>
  implements AgentRepository
{
  protected entitySchema(): EntitySchema<Agent> {
    return AgentEntity;
  }

  async save(agent: Agent): Promise<void> {
    return this.persist(agent);
  }

  async findById(id: number): Promise<Agent | null> {
    const repository = await this.repository();
    return repository.findOne({
      where: { id },
    });
  }

  async findByIdCompany(idCompany: number): Promise<Agent[]> {
    const repository = await this.repository();

    return repository.find({
      where: { idCompany },
    });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<Agent | null> {
    const repository = await this.repository();
    return repository.findOne({
      where: { phone: phoneNumber },
    });
  }

  async findGroupedByUser(): Promise<any[]> {
    const client = await this.client();

    const rawData = await client.manager
      .createQueryBuilder(AgentEntity, "agent")
      .select("user.id", "user_id")
      .addSelect("user.name", "user_name")
      .addSelect("user.email", "user_email")
      .addSelect("agent.name", "agent_name")
      .addSelect("agent.phone", "phone")
      .addSelect("agent.months_to_expire", "expire")
      .addSelect("agent.expire_at", "expire_at")
      .leftJoin("user", "user", "user.id = agent.idcompany")
      .orderBy("user.id", "ASC")
      .getRawMany<{
        user_id: number;
        user_name: string;
        user_email: string;
        agent_name: string;
        phone: string;
        expire: number;
        expire_at: string;
      }>();

    // Transform Data: Group agents under each user
    const userMap = new Map<number, any>();

    rawData.forEach((item) => {
      if (!userMap.has(item.user_id)) {
        userMap.set(item.user_id, {
          user_id: item.user_id,
          user_name: item.user_name,
          user_email: item.user_email,
          agents: [],
        });
      }

      const user = userMap.get(item.user_id);
      user.agents.push({
        agent_name: item.agent_name,
        phone: item.phone,
        expire: item.expire,
        expire_at: item.expire_at,
      });
    });

    return Array.from(userMap.values());
  }
}
