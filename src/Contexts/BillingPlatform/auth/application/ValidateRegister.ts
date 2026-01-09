import { EncryptionService } from "../../../Shared/infrastructure/encryption/EncryptionService";
import { HashService } from "../../../Shared/infrastructure/encryption/HashService";
import { CreateCompany } from "../../company/application/use-cases/CreateCompany";
import { Role } from "../../company/domain/Company";

type RegisterEncryptedData = {
  name: string;
  password: string;
  email: string;
  isCollectionCompany: boolean;
  companyName: string;
};

export class ValidateRegister {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly hashService: HashService,
    private readonly createCompany: CreateCompany
  ) {}

  async run(params: { encryptedData: string }) {
    const decryptedData = this.encryptionService.decrypt(params.encryptedData);
    console.log(decryptedData);

    const data: RegisterEncryptedData = JSON.parse(decryptedData);

    data.password = this.hashService.hash(data.password);

    await this.createCompany.run({
      name: data.name,
      email: data.email,
      password: data.password,
      role: Role.USER,
      isCollectionCompany: data.isCollectionCompany,
      companyName: data.companyName,
    });
  }
}
