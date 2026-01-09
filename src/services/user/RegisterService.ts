// Models
import { User } from "../../models/User";
// Schema
import { registerInterface } from "../../schemas/UserSchema";
// Error
import { httpError } from "../../config/CustomError";
// Transporter email
import { transportMail } from "../../config/Email";
// Enviroment variables
import {
  email,
  backend_host,
  crypt_algorithm,
  crypt_key,
  crypt_iv,
} from "../../config/Constants";
// Encryption
import { encrypt, decrypt } from "../../config/Encyption";
// Helpers
import { hashPassword } from "../../helpers/user/UserHelper";
import { searchModel } from "../../helpers/SearchModel";
import { capitalizeWords, deleteBlankSpaces } from "../../helpers/FormatString";
import { CreateCompany } from "../../Contexts/BillingPlatform/company/application/use-cases/CreateCompany";
import { companyRepository } from "../../Contexts/Shared/infrastructure/dependencies";
import { Role } from "../../Contexts/BillingPlatform/company/domain/Company";
import { ValidateRegister } from "../../Contexts/BillingPlatform/auth/application/ValidateRegister";
import { CryptoEncryptionService } from "../../Contexts/Shared/infrastructure/encryption/CryptoEncryptionService";
import { BcryptHashService } from "../../Contexts/Shared/infrastructure/encryption/BcryptHashService";

// Encrypt the user data for the link
export async function preRegister(data: registerInterface) {
  // Check if the user already exists
  // Change the user name
  data.name = capitalizeWords(deleteBlankSpaces(data.name));
  if (!(await searchModel(User, [{ name: data.name }, { email: data.email }])))
    throw new httpError("Este usuario ya existe", 400);
  // Encrypt the data
  return encrypt(JSON.stringify(data));
}

export function createConfirmationLink(encryptedUserData: string) {
  return `${backend_host}/api/register/validate/${encryptedUserData}`;
}

export async function sendConfirmation(link: string, toEmail: string) {
  await transportMail.sendMail({
    from: email,
    to: toEmail,
    subject: "Creación de cuenta",
    html: `
        <p>Para comenzar, simplemente haz clic en el siguiente enlace para crear tu cuenta:</p>
        <p><a href=${link}>Crear cuenta</a></p>
        `,
  });
}

export async function validateRegister(encryptedText: string) {
  const validateRegisterUseCase = new ValidateRegister(
    new CryptoEncryptionService(crypt_algorithm!, crypt_key!, crypt_iv!),
    new BcryptHashService(),
    new CreateCompany(companyRepository)
  );

  await validateRegisterUseCase.run({
    encryptedData: encryptedText,
  });

  return { message: "Usuario activado" };
}
