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
import { sendMessageChat, sendErrorMessage } from "../../services/chat/WhatsAppService";
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

router.post(
  "/send/csv",
  upload.single("file"),
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      console.log("🚀 WhatsApp CSV Upload: Starting processing...");
      console.log(
        `📊 WhatsApp CSV Upload: Company ID: ${req.params.idToken}, Client ID: ${req.body.idClient}, Country: ${req.body.countryCode}`
      );

      if (!req.file) {
        return res.status(400).send({ message: "No file provided" });
      }

      const workbook = xlsx.read(req.file?.buffer, { type: "buffer" });

      const rawIdClient = req.body.idClient;
      const idClient =
        rawIdClient &&
        rawIdClient !== "undefined" &&
        rawIdClient !== "null" &&
        String(rawIdClient).trim() !== ""
          ? Number(rawIdClient)
          : 0;

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

      await processWorkbookUseCase.run({
        workbook,
        idCompany: Number(req.params.idToken),
        idClient: idClient,
        countryCode: req.body.countryCode,
      });

      return res.send({ message: "Mensajes enviados" });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

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

router.post(
  "/chat/:cellphone",
  verifyToken,
  messageChatValidator,
  async (req, res) => {
    try {
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

router.post("/status", async (req, res) => {
  try {
    const from = req.body.From;
    const to = req.body.To;
    const status = req.body.MessageStatus;
    const message = req.body.ErrorMessage;
    const response = await sendErrorMessage(from, to, status, message);
    return res.status(200).json(response);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
