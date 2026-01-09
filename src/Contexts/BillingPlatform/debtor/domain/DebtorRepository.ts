import { Debtor } from "./Debtor";

export interface DebtorRepository {
  save(debtor: Debtor): Promise<void>;
  saveAndReturn(debtor: Debtor): Promise<Debtor>;
  findByDocument(id_user: number, document: number): Promise<Debtor | null>;
  findByCellphone(
    from: number,
    to: number,
    idUser?: number
  ): Promise<Debtor | null>;
  findByTelephone(
    from: number,
    to: number,
    idUser?: number
  ): Promise<Debtor | null>;
  findByCompany(companyId: number): Promise<Debtor[] | null>;
}
