import { DebtorRepository } from "../DebtorRepository";

export class DebtorExistByDocument {
  constructor(private readonly debtorRepository: DebtorRepository) {}

  async run(params: { id_user: number; document: number }) {
    const debtor = await this.debtorRepository.findByDocument(
      params.id_user,
      params.document
    );

    return debtor !== null;
  }
}
