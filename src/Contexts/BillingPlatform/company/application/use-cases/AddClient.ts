import { Client } from "../../domain/Client";
import { CompanyRepository } from "../../domain/CompanyRepository";
import { CompanyNotFoundException } from "../../domain/exceptions/CompanyNotFound";

export class AddClient {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: {
    idCompany: number;
    name: string;
    activity: string;
    address: string;
    service: string;
    segment: string;
    phone: string;
  }): Promise<void> {
    const company = await this.companyRepository.findById(params.idCompany);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    const client = Client.create({
      name: params.name,
      idCompany: params.idCompany,
      activity: params.activity,
      address: params.address,
      service: params.service,
      segment: params.segment,
      phone: params.phone,
    });

    company.addClient(client);

    await this.companyRepository.save(company);
  }
}
