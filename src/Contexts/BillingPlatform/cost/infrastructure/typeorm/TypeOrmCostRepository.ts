import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Cost, CostType } from "../../domain/Cost";
import { CostRepository } from "../../domain/CostRepository";
import { CostEntity } from "./CostEntity";

export class TypeOrmCostRepository
  extends TypeOrmRepository<Cost>
  implements CostRepository
{
  protected entitySchema(): EntitySchema<Cost> {
    return CostEntity;
  }

  async save(cost: Cost): Promise<void> {
    await this.persist(cost);
  }

  async findByType(type: CostType): Promise<Cost[] | null> {
    const repository = await this.repository();

    return repository.find({
      where: { type },
    });
  }

  async findCostsByCompany(idCompany: number): Promise<Cost[]> {
    const repository = await this.repository();

    return repository.find({ where: { idCompany } });
  }

  async findGroupedByType(): Promise<any> {
    const client = await this.client();

    const rawData = await client.manager
      .createQueryBuilder(CostEntity, "cost")
      .select("cost.type", "type")
      .addSelect("cost.idcompany", "idcompany")
      .addSelect("SUM(cost.amount)", "amount")
      .leftJoin("user", "user", "user.id = cost.idcompany")
      .addSelect("user.name", "userName")
      .addSelect("user.email", "userEmail")
      .groupBy("cost.type")
      .addGroupBy("cost.idcompany")
      .addGroupBy("user.name")
      .addGroupBy("user.email")
      .orderBy("cost.idcompany", "ASC") // Add order by idcompany
      .getRawMany<{
        type: CostType;
        idcompany: number;
        amount: number;
        userName: string;
        userEmail: string;
      }>();

    // Data Transformation
    const transformedData: any[] = [];

    const userMap = new Map<number, any>();

    for (const item of rawData) {
      if (!userMap.has(item.idcompany)) {
        userMap.set(item.idcompany, {
          id: item.idcompany,
          userName: item.userName,
          userEmail: item.userEmail,
          agent: 0,
          call: 0,
          whatsapp: 0,
          sms: 0,
          email: 0,
          total: 0,
        });
      }

      const user = userMap.get(item.idcompany);

      if (user) {
        user[item.type] = item.amount;
        user.total += item.amount;
      }
    }

    for (const value of userMap.values()) {
      transformedData.push(value);
    }

    return transformedData;
  }
}
