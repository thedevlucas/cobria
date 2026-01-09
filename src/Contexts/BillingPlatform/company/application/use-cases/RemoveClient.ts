import { CompanyRepository } from "../../domain/CompanyRepository";
import { CompanyNotFoundException } from "../../domain/exceptions/CompanyNotFound";

export class RemoveClient {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async run(params: { companyId: number; clientId: number }) {
    const company = await this.companyRepository.findById(params.companyId);

    if (company === null) {
      throw new CompanyNotFoundException();
    }

    const client = company.clients.find(
      (client) => client.id === params.clientId
    );

    if (client === undefined) {
      throw new Error("No se encontro el cliente");
    }

    company.removeClient(client);

    await this.companyRepository.removeClient(client);
  }
}
