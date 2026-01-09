// Dependencies
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import xlsx from "xlsx";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Error
import { errorHandler } from "../../config/CustomError";
// Services
import { sendRecievedMessageCall } from "../../services/chat/CallService";
import { getCallChat } from "../../services/chat/CallChatService";
import { getTelephone } from "../../services/user/UserService";
// Helpers
import { verifyToken } from "../../helpers/Token";
import { XlsxWorkbookProcessor } from "../../Contexts/BillingPlatform/debtor/infrastructure/XlsxWorkbookProcessor";
import { WorkbookToJson } from "../../Contexts/BillingPlatform/debtor/application/services/WorkbookToJson";
import { MakeCall } from "../../Contexts/BillingPlatform/debtor/application/services/MakeCall";
import {
  agentRepository,
  callChatRepository,
  companyRepository,
  costRepository,
  debtorRepository,
} from "../../Contexts/Shared/infrastructure/dependencies";
import { CreateDebtor } from "../../Contexts/BillingPlatform/debtor/application/use-cases/CreateDebtor";
import { CreateCallChat } from "../../Contexts/BillingPlatform/chat/application/use-cases/CreateCallChat";
import { TwillioCommunication } from "../../Contexts/BillingPlatform/chat/infrastructure/TwillioCommunication";
import { ValidateScheduleConfig } from "../../Contexts/BillingPlatform/debtor/application/services/ValidateScheduleConfig";
import { ListMessageSchedule } from "../../Contexts/BillingPlatform/company/application/use-cases/ListMessageSchedule";
import { CompanyExistById } from "../../Contexts/BillingPlatform/company/domain/services/CompanyExistById";
import { ProcessWorkbookToMakeCalls } from "../../Contexts/BillingPlatform/debtor/application/use-cases/ProcessWorkbookToMakeCalls";
import { ProcessIncomingCallResponse } from "../../Contexts/BillingPlatform/chat/application/use-cases/ProcessIncomingCallResponse";

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post(
  "/send/csv",
  upload.single("file"),
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const workbook = xlsx.read(req.file?.buffer, { type: "buffer" });
      const xlsxWorkbookProcessor = new XlsxWorkbookProcessor();
      const workbookToJsonService = new WorkbookToJson(xlsxWorkbookProcessor);

      const makeCallService = new MakeCall(
        debtorRepository,
        new CreateDebtor(debtorRepository),
        new CreateCallChat(callChatRepository),
        new TwillioCommunication(),
        new ValidateScheduleConfig(new ListMessageSchedule(companyRepository)),
        costRepository,
        companyRepository
      );

      const processWorkbook = new ProcessWorkbookToMakeCalls(
        workbookToJsonService,
        makeCallService,
        new CompanyExistById(companyRepository),
        agentRepository
      );

      await processWorkbook.run({
        workbook,
        idCompany: Number(req.params.idToken),
        agentPhoneNumber: req.body.agentPhoneNumber,
        countryCode: req.body.countryCode,
      });

      return res.send({ message: "Llamando a los deudores" });
    } catch (error) {
      errorHandler(error, res);
    }
  }
);

router.post("/incoming", async (req, res) => {
  try {
    const userResponse = req.body.SpeechResult || "";
    const from = req.body.From;
    const to = req.body.To;

    const processIncomingCallResponse = new ProcessIncomingCallResponse(
      debtorRepository,
      callChatRepository,
      costRepository,
      new TwillioCommunication()
    );

    const response = await processIncomingCallResponse.run({
      fromNumber: to,
      toNumber: from,
      message: userResponse,
    });

    // Ensure response is valid TwiML
    if (!response.includes("<Response>")) {
      throw new Error("Invalid TwiML response generated");
    }

    res.type("text/xml");
    res.send(response);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

router.get("/chat/:telephone", verifyToken, async (req, res) => {
  try {
    const idUser = Number(req.params.idToken);
    const chats = await getCallChat(idUser, Number(req.params.telephone));
    return res.status(200).json(chats);
  } catch (error) {
    errorHandler(error, res);
  }
});

module.exports = router;
