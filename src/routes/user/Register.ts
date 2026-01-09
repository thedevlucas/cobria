// Dependencies
import express from "express";
// Schema
import { registerValidator } from "../../schemas/UserSchema";
// CustomError
import { errorHandler } from "../../config/CustomError";
// Services
import {
  preRegister,
  createConfirmationLink,
  sendConfirmation,
  validateRegister,
} from "../../services/user/RegisterService";
// Constants
import {
  crypt_algorithm,
  crypt_iv,
  crypt_key,
  frontend_host,
} from "../../config/Constants";
import { TypeOrmClientFactory } from "../../Contexts/Shared/infrastructure/typeorm/TypeOrmClientFactory";
import { databaseConfigProps } from "../../config/Database";
import { TypeOrmCompanyRepository } from "../../Contexts/BillingPlatform/company/infrastructure/typeorm/TypeOrmCompanyRepository";
import { ValidateRegister } from "../../Contexts/BillingPlatform/auth/application/ValidateRegister";
import { CryptoEncryptionService } from "../../Contexts/Shared/infrastructure/encryption/CryptoEncryptionService";
import { BcryptHashService } from "../../Contexts/Shared/infrastructure/encryption/BcryptHashService";
import { CreateCompany } from "../../Contexts/BillingPlatform/company/application/use-cases/CreateCompany";
import { CompanyExistByEmailOrName } from "../../Contexts/BillingPlatform/company/domain/services/CompanyExistByEmailOrName";
import { Register } from "../../Contexts/BillingPlatform/auth/application/Register";
import { NodemailerEmailService } from "../../Contexts/Shared/infrastructure/email/NodemailerEmailService";
import { capitalizeWords } from "../../Contexts/BillingPlatform/utils/capitalize-words";
import { removeBlankSpaces } from "../../Contexts/BillingPlatform/utils/remove-bank-spaces";

const router = express.Router();

let datasourceClient: any;
let companyRepository: any;

// Initialize database connection
TypeOrmClientFactory.createClient("company", databaseConfigProps)
  .then((client) => {
    datasourceClient = client;
    companyRepository = new TypeOrmCompanyRepository(datasourceClient);
  })
  .catch((error) => {
    console.error("Failed to initialize database connection:", error);
  });

// Register route
router.post("/", registerValidator, async (req, res) => {
  try {
    // Check if database connection is ready
    if (!companyRepository) {
      return res.status(503).json({ 
        message: "Database connection not ready. Please try again." 
      });
    }

    const data = req.body;

    // Validate encryption environment variables
    if (!crypt_algorithm || !crypt_key || !crypt_iv) {
      return res.status(500).json({ 
        message: "Encryption configuration is missing. Please check environment variables." 
      });
    }

    // Validate key length (must be 32 bytes for AES-256)
    const keyLength = Buffer.from(crypt_key, "utf8").length;
    if (keyLength !== 32) {
      console.warn(`Warning: CRYPT_KEY should be exactly 32 bytes for AES-256. Current length: ${keyLength}`);
    }

    // Validate IV length (must be 16 bytes for AES)
    const ivLength = Buffer.from(crypt_iv, "utf8").length;
    if (ivLength !== 16) {
      console.warn(`Warning: CRYPT_IV should be exactly 16 bytes for AES. Current length: ${ivLength}`);
    }

    const registerUseCase = new Register(
      new CryptoEncryptionService(crypt_algorithm, crypt_key, crypt_iv),
      new NodemailerEmailService(),
      new CompanyExistByEmailOrName(companyRepository)
    );

    await registerUseCase.run({
      name: capitalizeWords(removeBlankSpaces(data.name)),
      password: data.password,
      email: data.email,
      isCollectionCompany: data.isCollectionCompany,
      companyName: capitalizeWords(removeBlankSpaces(data.companyName)),
    });

    return res
      .status(200)
      .json({ message: "Usuario creado, revisa tu email para activarlo" });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Activate user
router.get("/validate/:encryptedText", async (req, res) => {
  try {
    const validateRegisterUseCase = new ValidateRegister(
      new CryptoEncryptionService(crypt_algorithm!, crypt_key!, crypt_iv!),
      new BcryptHashService(),
      new CreateCompany(companyRepository)
    );

    await validateRegisterUseCase.run({
      encryptedData: req.params.encryptedText,
    });

    res.redirect(frontend_host || "/");
  } catch (error: any) {
    errorHandler(error, res);
  }
});

module.exports = router;
