import { EntitySchema } from "typeorm";
import { CellphoneRepository } from "../../domain/CellphoneRepository";
import { TypeOrmRepository } from "../../../../Shared/infrastructure/typeorm/TypeOrmRepository";
import { Cellphone } from "../../domain/Cellphone";
// CORRECCIÓN: Importar CellphoneEntity en lugar de AgentEntity
import { CellphoneEntity } from "./CellphoneEntity"; 

export class TypeOrmCellphoneRepository
  extends TypeOrmRepository<Cellphone>
  implements CellphoneRepository
{
  protected entitySchema(): EntitySchema<Cellphone> {
    // CORRECCIÓN: Retornar CellphoneEntity
    return CellphoneEntity; 
  }

  async save(cellphone: Cellphone): Promise<void> {
    return this.persist(cellphone);
  }

  async findById(id: number): Promise<Cellphone | null> {
    const repository = await this.repository();
    return repository.findOneBy({ id });
  }

  async update(cellphone: Cellphone): Promise<void> {
    const repository = await this.repository();
    await repository.save(cellphone);
  }

  async findByDebtorId(debtorId: number): Promise<Cellphone[]> {
    const repository = await this.repository();
    return repository.findBy({ id_debtor: debtorId });
  }

  async findByCellphoneNumber(
    from: number,
    to: number
  ): Promise<Cellphone | null> {
    const repository = await this.repository();
    return repository.findOneBy({ from: from, to: to });
  }

  async delete(id: number): Promise<void> {
    const repository = await this.repository();
    await repository.delete(id);
  }
}