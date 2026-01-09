import { CompanyRepository } from "../../domain/CompanyRepository";

export class UpdateClient {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: {
    id: number;
    name: string;
    activity: string;
    address: string;
    service: string;
    segment: string;
    idCompany: number;
    phone: string;
  }) {
    const company = await this.companyRepository.findById(params.idCompany);

    if (company === null) {
      throw new Error("No se encontro la compañia");
    }

    const client = company.clients.find((client) => client.id === params.id);

    if (!client) {
      throw new Error("No se encontro el cliente");
    }

    client.update({
      name: params.name,
      activity: params.activity,
      address: params.address,
      service: params.service,
      segment: params.segment,
      phone: params.phone,
    });

    company.updateClient(client);

    await this.companyRepository.save(company);

    return client;
  }
}
