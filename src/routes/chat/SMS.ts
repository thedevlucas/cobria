import { Router, Request, Response } from "express";
import xlsx from "xlsx";
import { verifyToken } from "../../helpers/Token";
import { errorHandler } from "../../config/CustomError";
const multer = require("multer");

// Repositorios y dependencias compartidas
import {
  chatRepository,
  companyRepository,
  costRepository,
  debtorRepository,
} from "../../Contexts/Shared/infrastructure/dependencies";

// Servicios y Casos de Uso
import { ProcessWorkbookForSms } from "../../Contexts/BillingPlatform/debtor/application/use-cases/ProcessWorkbookForSms";
import { SendSmsMessage } from "../../Contexts/BillingPlatform/debtor/application/services/SendSmsMessage";
import { WorkbookToJson } from "../../Contexts/BillingPlatform/debtor/application/services/WorkbookToJson";
import { XlsxWorkbookProcessor } from "../../Contexts/BillingPlatform/debtor/infrastructure/XlsxWorkbookProcessor";
import { CreateDebtor } from "../../Contexts/BillingPlatform/debtor/application/use-cases/CreateDebtor";
import { CreateChat } from "../../Contexts/BillingPlatform/chat/application/use-cases/CreateChat";
import { TwillioCommunication } from "../../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { ValidateScheduleConfig } from "../../Contexts/BillingPlatform/debtor/application/services/ValidateScheduleConfig";
import { CompanyExistById } from "../../Contexts/BillingPlatform/company/domain/services/CompanyExistById";
import { ListMessageSchedule } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";

// IMPORTANTE: Agregamos los imports para el procesamiento de mensajes entrantes
import { ProcessIncomingMessage } from "../../Contexts/BillingPlatform/chat/application/use-cases/ProcessIncomingMessage";
import { ProcessImageMessage } from "../../Contexts/BillingPlatform/chat/application/services/ProcessImageMessage";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// RUTA PARA ENVIAR SMS MASIVOS DESDE EXCEL
router.post(
  "/send/csv",
  upload.single("file"),
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) return res.status(400).send({ message: "No file provided" });

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

      const listMessageSchedule = new ListMessageSchedule(companyRepository);
      const validateScheduleService = new ValidateScheduleConfig(listMessageSchedule);
      const workbookToJsonService = new WorkbookToJson(new XlsxWorkbookProcessor());
      const createDebtorService = new CreateDebtor(debtorRepository);
      const communicationService = new TwillioCommunication();
      
      const sendSmsMessageService = new SendSmsMessage(
        debtorRepository,
        createDebtorService,
        new CreateChat(chatRepository),
        communicationService,
        validateScheduleService,
        costRepository,
        companyRepository,
        chatRepository
      );

      const processWorkbookForSms = new ProcessWorkbookForSms(
        workbookToJsonService,
        sendSmsMessageService,
        new CompanyExistById(companyRepository)
      );

      await processWorkbookForSms.run({
        workbook,
        idCompany: Number(req.params.idToken),
        idClient: Number(req.body.idClient) || 0,
        countryCode: req.body.countryCode,
      });

      return res.send({ message: "SMS procesados correctamente" });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

// WEBHOOK PARA RECIBIR RESPUESTAS POR SMS (Configurar en Twilio)
router.post("/incoming", async (req: Request, res: Response) => {
  try {
    const message = req.body.Body || "";
    const debtorNumber = req.body.From;
    const serviceNumber = req.body.To;

    const processIncomingMessageUseCase = new ProcessIncomingMessage(
      debtorRepository,
      chatRepository,
      new ProcessImageMessage(),
      new TwillioCommunication(),
      costRepository
    );

    const response = await processIncomingMessageUseCase.run({
      serviceNumber,
      debtorNumber,
      message,
      media: {},
    });

    return res.status(200).json(response);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

router.post("/chat/:cellphone", verifyToken, async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const { cellphone, idToken } = req.params;

    // 1. Buscamos la empresa para obtener su número de Twilio
    const company = await companyRepository.findById(Number(idToken));
    if (!company) return res.status(404).json({ message: "Empresa no encontrada" });

    // El número remitente (From) debe ser el de Twilio configurado para la empresa
    const fromNumber = company.telephone?.toString() || process.env.TWILIO_SMS_NUMBER || "";
    console.log("Enviando SMS desde:", fromNumber, "a:", cellphone);
    const communication = new TwillioCommunication();

    // 2. Enviamos el SMS real
    await communication.sendSmsMessage({
      idUser: Number(idToken),
      from: fromNumber,
      to: cellphone,
      message: message
    });

    // 3. Guardamos en la base de datos para que aparezca en el chat
    const { CreateChat } = require("../../Contexts/BillingPlatform/chat/application/use-cases/CreateChat");
    const createChatUseCase = new CreateChat(chatRepository);
    
    await createChatUseCase.run({
      idUser: Number(idToken),
      fromCellphone: Number(fromNumber.replace(/\D/g, '')),
      toCellphone: Number(cellphone.replace(/\D/g, '')),
      message: message
    });

    return res.status(200).json({ message: "SMS enviado" });
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;