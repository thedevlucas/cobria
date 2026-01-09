// Dependencies
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import xlsx from "xlsx";
const multer = require("multer");
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Error
import { errorHandler } from "../../config/CustomError";
// Helpers
import { verifyToken } from "../../helpers/Token";
// Services
import {
  sendMessageChat,
  sendErrorMessage,
} from "../../services/chat/WhatsAppService";
// Schema
import { messageChatValidator } from "../../schemas/ChatSchema";
import { GetChatsByUser } from "../../Contexts/BillingPlatform/chat/application/use-cases/GetChatsByUser";
import { ProcessWorkbook } from "../../Contexts/BillingPlatform/debtor/application/use-cases/ProcessWorkbook";
import { XlsxWorkbookProcessor } from "../../Contexts/BillingPlatform/debtor/infrastructure/XlsxWorkbookProcessor";
import { SendStartingMessage } from "../../Contexts/BillingPlatform/debtor/application/services/SendStartingMessage";
import {
  chatRepository,
  companyRepository,
  costRepository,
  debtorRepository,
} from "../../Contexts/Shared/infrastructure/dependencies";
import { CreateDebtor } from "../../Contexts/BillingPlatform/debtor/application/use-cases/CreateDebtor";
import { TwillioCommunication } from "../../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { CreateChat } from "../../Contexts/BillingPlatform/chat/application/use-cases/CreateChat";
import { WorkbookToJson } from "../../Contexts/BillingPlatform/debtor/application/services/WorkbookToJson";
import { CompanyExistById } from "../../Contexts/BillingPlatform/company/domain/services/CompanyExistById";
import { ValidateScheduleConfig } from "../../Contexts/BillingPlatform/debtor/application/services/ValidateScheduleConfig";
import { ListMessageSchedule } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";
import { ProcessIncomingMessage } from "../../Contexts/BillingPlatform/chat/application/use-cases/ProcessIncomingMessage";
import { ProcessImageMessage } from "../../Contexts/BillingPlatform/chat/application/services/ProcessImageMessage";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Get the csv and send messages to the chats
router.post(
  "/send/csv",
  upload.single("file"),
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      console.log("🚀 WhatsApp CSV Upload: Starting processing...");
      console.log(`📊 WhatsApp CSV Upload: Company ID: ${req.params.idToken}, Client ID: ${req.body.idClient}, Country: ${req.body.countryCode}`);
      
      if (!req.file) {
        console.error("❌ WhatsApp CSV Upload: No file provided");
        return res.status(400).send({ message: "No file provided" });
      }
      
      console.log(`📁 WhatsApp CSV Upload: File received - Name: ${req.file.originalname}, Size: ${req.file.size} bytes`);
      
      const workbook = xlsx.read(req.file?.buffer, { type: "buffer" });
      console.log(`📋 WhatsApp CSV Upload: Workbook parsed - Sheets: ${Object.keys(workbook.Sheets).join(', ')}`);
      
      // Handle undefined idClient - use company ID as fallback
      const idClient = req.body.idClient && req.body.idClient !== 'undefined' 
        ? Number(req.body.idClient) 
        : Number(req.params.idToken);
      
      console.log(`🔧 WhatsApp CSV Upload: Using Client ID: ${idClient} (original: ${req.body.idClient})`);
      
      const xlsxWorkbookProcessor = new XlsxWorkbookProcessor();
      const workbookToJsonService = new WorkbookToJson(xlsxWorkbookProcessor);
      const sendStartingMessageService = new SendStartingMessage(
        debtorRepository,
        new CreateDebtor(debtorRepository),
        new CreateChat(chatRepository),
        new TwillioCommunication(),
        new ValidateScheduleConfig(new ListMessageSchedule(companyRepository)),
        costRepository,
        companyRepository,
        chatRepository
      );
      const processWorkbookUseCase = new ProcessWorkbook(
        workbookToJsonService,
        sendStartingMessageService,
        new CompanyExistById(companyRepository)
      );
      
      console.log("🔄 WhatsApp CSV Upload: Starting ProcessWorkbook...");
      await processWorkbookUseCase.run({
        workbook,
        idCompany: Number(req.params.idToken),
        idClient: idClient,
        countryCode: req.body.countryCode,
      });
      
      console.log("✅ WhatsApp CSV Upload: Processing completed successfully");
      return res.send({
        message: "Mensajes enviados",
      });
    } catch (error) {
      console.error("❌ WhatsApp CSV Upload Error:", error);
      errorHandler(error, res);
    }
  }
);

// Get the messages from the chat
router.post("/incoming", async (req, res) => {
  try {
    const message = req.body.Body || "";
    const debtorNumber = req.body.From;
    const serviceNumber = req.body.To;
    const image = req.body.MediaUrl0;
    const messageType = req.body.MessageType;
    const imageType = req.body.MediaContentType0;

    const processIncomingMessageUseCase = new ProcessIncomingMessage(
      debtorRepository,
      chatRepository,
      new ProcessImageMessage(),
      new TwillioCommunication(),
      costRepository
    );

    console.table({
      type: "whatsapp",
      fromNumber: debtorNumber,
      toNumber: serviceNumber,
      message: message,
    });

    const response = await processIncomingMessageUseCase.run({
      serviceNumber: serviceNumber,
      debtorNumber: debtorNumber,
      message: message,
      media: { image: image, message_type: messageType, image_type: imageType },
    });
    return res.status(200).json(response);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

router.get("/chat/:cellphone", verifyToken, async (req, res) => {
  try {
    const getChatsByUserUseCase = new GetChatsByUser(chatRepository);

    const chats = await getChatsByUserUseCase.run({
      idUser: Number(req.params.idToken),
      cellphone: Number(req.params.cellphone),
    });

    return res.status(200).json(chats);
  } catch (error) {
    errorHandler(error, res);
  }
});

// Send a message to the chat
router.post(
  "/chat/:cellphone",
  verifyToken,
  messageChatValidator,
  async (req, res) => {
    try {
      // TODO:

      const response = await sendMessageChat(
        Number(req.params.idToken),
        Number(req.params.cellphone),
        req.body.message
      );

      return res.status(200).json(response);
    } catch (error: any) {
      errorHandler(error, res);
    }
  }
);

// Get status of the chat
router.post("/status", async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const MessageStatus = req.body.MessageStatus;
    const message = req.body.ErrorMessage;
    const response = await sendErrorMessage(from, to, MessageStatus, message);
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
