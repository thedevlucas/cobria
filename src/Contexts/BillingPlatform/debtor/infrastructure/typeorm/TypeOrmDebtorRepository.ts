import { EntitySchema } from "typeorm";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Debtor } from "../../domain/Debtor";
import { DebtorRepository } from "../../domain/DebtorRepository";
import { DebtorEntity } from "./DebtorEntity";

export class TypeOrmDebtorRepository
  extends TypeOrmRepository<Debtor>
  implements DebtorRepository
{
  protected entitySchema(): EntitySchema<Debtor> {
    return DebtorEntity;
  }

  async save(debtor: Debtor): Promise<void> {
    return this.persist(debtor);
  }

  async saveAndReturn(debtor: Debtor): Promise<Debtor> {
    const returnedEntity = await this.persistAndReturn(debtor);

    return returnedEntity;
  }

  async findByDocument(
    id_user: number,
    document: number
  ): Promise<Debtor | null> {
    const repository = await this.repository();
    const debtor = await repository.findOne({
      where: { document, id_user },
    });

    return debtor;
  }

  async findByCellphone(
    from: number,
    to: number,
    idUser?: number
  ): Promise<Debtor | null> {
    // Validate parameters to prevent NaN values
    if (isNaN(from) || isNaN(to)) {
      console.log(`Invalid parameters for findByCellphone: from=${from}, to=${to}`);
      return null;
    }

    const client = await this.client();

    let query = client.manager
      .createQueryBuilder(DebtorEntity, "debtor")
      .leftJoinAndSelect("debtor.cellphones", "cellphone")
      .where("cellphone.from = :from", { from })
      .andWhere("cellphone.to = :to", { to });

    if (idUser) {
      query = query.andWhere("debtor.id_user = :idUser", { idUser });
    }

    const debtor = await query.getOne();
    return debtor;
  }

  async findByCompany(idCompany: number): Promise<Debtor[] | null> {
    const repository = await this.repository();
    const debtors = await repository.find({
      where: { id_user: idCompany },
    });

    return debtors;
  }

  async findByTelephone(
    from: number,
    to: number,
    idUser?: number
  ): Promise<Debtor | null> {
    const client = await this.client();

    let query = client.manager
      .createQueryBuilder(DebtorEntity, "debtor")
      .leftJoinAndSelect("debtor.telephones", "telephone")
      .where("telephone.from = :from", { from })
      .andWhere("telephone.to = :to", { to });

    if (idUser !== undefined) {
      query = query.andWhere("debtor.id_user = :idUser", { idUser });
    }

    const debtor = await query.getOne();
    return debtor;
  }
}
