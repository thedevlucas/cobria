import { Router, Request, Response } from "express";
import multer from "multer";
import xlsx from "xlsx";
import { verifyToken } from "../../helpers/Token";
import { errorHandler } from "../../config/CustomError";
import { ProcessWorkbookForEmail } from "../../Contexts/BillingPlatform/debtor/application/use-cases/ProcessWorkbookForEmail";
import { WorkbookToJson } from "../../Contexts/BillingPlatform/debtor/application/services/WorkbookToJson";
import { XlsxWorkbookProcessor } from "../../Contexts/BillingPlatform/debtor/infrastructure/XlsxWorkbookProcessor";
import { SendEmailMessage } from "../../Contexts/BillingPlatform/debtor/application/services/SendEmailMessage";
import { CompanyExistById } from "../../Contexts/BillingPlatform/company/domain/services/CompanyExistById";
import { TwillioCommunication } from "../../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { ValidateScheduleConfig } from "../../Contexts/BillingPlatform/debtor/application/services/ValidateScheduleConfig";
import { ListMessageSchedule } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";
import { CreateDebtor } from "../../Contexts/BillingPlatform/debtor/application/use-cases/CreateDebtor";
import { CreateChat } from "../../Contexts/BillingPlatform/chat/application/use-cases/CreateChat";
import { 
  debtorRepository, 
  costRepository, 
  companyRepository, 
  chatRepository 
} from "../../Contexts/Shared/infrastructure/dependencies";

const router = Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(upload.single("file"));

// Email send CSV endpoint
router.post(
  "/send/csv",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      console.log("🚀 Email CSV Upload: Starting processing...");
      console.log(`📊 Email CSV Upload: Company ID: ${req.params.idToken}, Client ID: ${req.body.idClient}, Country: ${req.body.countryCode}`);
      
      if (!req.file) {
        console.error("❌ Email CSV Upload: No file provided");
        return res.status(400).send({ message: "No file provided" });
      }
      
      console.log(`📁 Email CSV Upload: File received - Name: ${req.file.originalname}, Size: ${req.file.size} bytes`);
      
      const workbook = xlsx.read(req.file?.buffer, { type: "buffer" });
      console.log(`📋 Email CSV Upload: Workbook parsed - Sheets: ${Object.keys(workbook.Sheets).join(', ')}`);
      
      // Handle undefined idClient - use company ID as fallback
      const idClient = req.body.idClient && req.body.idClient !== 'undefined' 
        ? Number(req.body.idClient) 
        : Number(req.params.idToken);
      
      console.log(`🔧 Email CSV Upload: Using Client ID: ${idClient} (original: ${req.body.idClient})`);
      
      const xlsxWorkbookProcessor = new XlsxWorkbookProcessor();
      const workbookToJsonService = new WorkbookToJson(xlsxWorkbookProcessor);
      const sendEmailMessageService = new SendEmailMessage(
        debtorRepository,
        new CreateDebtor(debtorRepository),
        new CreateChat(chatRepository),
        new TwillioCommunication(),
        new ValidateScheduleConfig(new ListMessageSchedule(companyRepository)),
        costRepository,
        companyRepository,
        chatRepository
      );
      const processWorkbookUseCase = new ProcessWorkbookForEmail(
        workbookToJsonService,
        sendEmailMessageService,
        new CompanyExistById(companyRepository)
      );
      
      console.log("🔄 Email CSV Upload: Starting ProcessWorkbook...");
      await processWorkbookUseCase.run({
        workbook,
        idCompany: Number(req.params.idToken),
        idClient: idClient,
        countryCode: req.body.countryCode,
      });
      
      console.log("✅ Email CSV Upload: Processing completed successfully");
      return res.send({
        message: "Email collection started successfully. Emails will be sent to debtors.",
      });
    } catch (error) {
      console.error("❌ Email CSV Upload Error:", error);
      errorHandler(error, res);
    }
  }
);

module.exports = router;
