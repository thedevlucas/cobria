import { Debtor, Status } from "../../domain/Debtor";
import { DebtorRepository } from "../../domain/DebtorRepository";
import { DebtorExistByDocument } from "../../domain/services/DebtorExistByDocument";

const DAYS_TO_CHARGED_OFF = 60;

export class CreateDebtor {
  private readonly debtorExistValidator: DebtorExistByDocument;

  constructor(private readonly debtorRepository: DebtorRepository) {
    this.debtorExistValidator = new DebtorExistByDocument(debtorRepository);
  }

  async run(params: {
    name: string;
    document: number;
    idUser: number;
    debtDate?: Date;
  }): Promise<Debtor> {
    console.log(`🔍 CreateDebtor: Processing debtor - Name: ${params.name}, Document: ${params.document}, User: ${params.idUser}`);
    
    const debtorExist = await this.debtorRepository.findByDocument(
      params.idUser,
      params.document
    );

    if (debtorExist) {
      console.log(`✅ CreateDebtor: Debtor already exists - ID: ${debtorExist.id}`);
      return debtorExist;
    }

    const debtorStatus = params.debtDate
      ? this.calculateDebtorStatus(params.debtDate)
      : Status.CHARGED_OFF;

    console.log(`📝 CreateDebtor: Creating new debtor with status: ${debtorStatus}`);

    const debtor = Debtor.create({
      name: params.name,
      document: params.document,
      id_user: params.idUser,
      status: debtorStatus,
    });

    console.log(`💾 CreateDebtor: Saving debtor to database...`);
    const savedDebtor = await this.debtorRepository.saveAndReturn(debtor);
    console.log(`✅ CreateDebtor: Debtor saved successfully - ID: ${savedDebtor.id}`);
    
    return savedDebtor;
  }

  private calculateDebtorStatus(debtDate: Date): Status {
    const currentDate = new Date();
    const diff = currentDate.getTime() - debtDate.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days > DAYS_TO_CHARGED_OFF) {
      return Status.OVERDUE;
    }

    return Status.CHARGED_OFF;
  }
}
