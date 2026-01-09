import { Cellphone } from "./Cellphone";

export interface CellphoneRepository {
  save(cellphone: Cellphone): Promise<void>;
  findById(id: number): Promise<Cellphone | null>;
  update(cellphone: Cellphone): Promise<void>;
  delete(id: number): Promise<void>;
  findByDebtorId(debtorId: number): Promise<Cellphone[]>;
  findByCellphoneNumber(from: number, to: number): Promise<Cellphone | null>;
}
