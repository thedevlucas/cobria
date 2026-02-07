import { Company, Role } from "../../domain/Company";
import { CompanyRepository } from "../../domain/CompanyRepository";

export class CreateCompany {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: {
    name: string;
    password: string;
    email: string;
    role: Role;
    isCollectionCompany: boolean;
    companyName: string;
    cellphone?: number;
    telephone?: number;
  }): Promise<void> {
    const company = Company.create({
      name: params.name,
      password: params.password,
      role: params.role,
      email: params.email,
      cellphone: params.cellphone || null,
      telephone: params.telephone || null,
      isCollectionCompany: params.isCollectionCompany,
      companyName: params.companyName,
    });

    return await this.companyRepository.save(company);
  }
}
