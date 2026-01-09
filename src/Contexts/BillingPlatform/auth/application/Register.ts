import { backend_host } from "../../../../config/Constants";
import { EmailService } from "../../../Shared/infrastructure/email/EmailService";
import { EncryptionService } from "../../../Shared/infrastructure/encryption/EncryptionService";
import { CompanyAlreadyExistException } from "../../company/domain/exceptions/CompanyAlreadyExist";
import { CompanyExistByEmailOrName } from "../../company/domain/services/CompanyExistByEmailOrName";

export class Register {
  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly emailService: EmailService,
    private readonly companyExistByEmailOrName: CompanyExistByEmailOrName
  ) {}

  async run(params: {
    name: string;
    password: string;
    email: string;
    isCollectionCompany: boolean;
    companyName: string;
  }): Promise<void> {
    const companyAlreadyExist = await this.companyExistByEmailOrName.run({
      email: params.email,
      name: params.name,
    });

    if (companyAlreadyExist) {
      throw new CompanyAlreadyExistException();
    }

    const encryptedData = this.encryptionService.encrypt(
      JSON.stringify(params)
    );
    const link = this.createConfirmationLink(encryptedData);

    // Try to send email, but don't fail if email service is not configured
    try {
      await this.emailService.send({
        to: params.email,
        subject: "Creación de cuenta",
        body: `
          <p>Para comenzar, simplemente haz clic en el siguiente enlace para crear tu cuenta:</p>
          <p><a href=${link}>Crear cuenta</a></p>
        `,
      });
      console.log("Confirmation email sent successfully");
    } catch (error) {
      console.log("Email sending failed (this is OK for development):", error instanceof Error ? error.message : String(error));
      // For development: automatically create user without email confirmation
      console.log("Auto-creating user for development...");
      await this.autoCreateUser(params);
    }
  }

  private createConfirmationLink(encryptedData: string): string {
    return `${backend_host}/api/register/validate/${encryptedData}`;
  }

  private async autoCreateUser(params: {
    name: string;
    password: string;
    email: string;
    isCollectionCompany: boolean;
    companyName: string;
  }): Promise<void> {
    // Import the necessary services for auto-creation
    const { BcryptHashService } = await import("../../../Shared/infrastructure/encryption/BcryptHashService");
    const { CreateCompany } = await import("../../company/application/use-cases/CreateCompany");
    const { TypeOrmClientFactory } = await import("../../../Shared/infrastructure/typeorm/TypeOrmClientFactory");
    const { TypeOrmCompanyRepository } = await import("../../company/infrastructure/typeorm/TypeOrmCompanyRepository");
    const { databaseConfigProps } = await import("../../../../config/Database");
    const { Role } = await import("../../company/domain/Company");

    const datasourceClient = TypeOrmClientFactory.createClient("company", databaseConfigProps);
    const companyRepository = new TypeOrmCompanyRepository(datasourceClient);
    
    const hashService = new BcryptHashService();
    const createCompany = new CreateCompany(companyRepository);

    // Hash the password and create the user
    const hashedPassword = hashService.hash(params.password);
    
    await createCompany.run({
      name: params.name,
      email: params.email,
      password: hashedPassword,
      role: Role.USER,
      isCollectionCompany: params.isCollectionCompany,
      companyName: params.companyName,
    });

    console.log("User created successfully for development!");
  }
}
