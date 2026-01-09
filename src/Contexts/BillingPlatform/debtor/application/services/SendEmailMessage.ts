import {
  cellphoneInfo,
  gptPromptsJson,
  twilio_whatsapp_number,
} from "../../../../../config/Constants";
import { CreateChat } from "../../../chat/application/use-cases/CreateChat";
import { Communication } from "../../../chat/domain/Communication";
import { WorkbookRow } from "../../domain/WorkbookProcessor";
import { CreateDebtor } from "../use-cases/CreateDebtor";
import { DebtorRepository } from "../../domain/DebtorRepository";
import { ValidateScheduleConfig } from "./ValidateScheduleConfig";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { Cost, CostType } from "../../../cost/domain/Cost";
import { createCellphone4Csv } from "../../../../../helpers/chat/whatsapp/WhatsAppHelper";
import { CompanyRepository } from "../../../company/domain/CompanyRepository";
import { Client } from "../../../company/domain/Client";
import { PendingMessage } from "../../../../../models/PendingMessage";
import { PendingMessageType } from "../../../company/domain/PendingMessages";
import { httpError } from "../../../../../config/CustomError";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { Role } from "../../../company/domain/Company";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { Chat } from "../../../chat/domain/Chat";
import { sendDebtMessage } from "../../../../../helpers/chat/whatsapp/GPTHelper";

export class SendEmailMessage {
  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly createDebtorService: CreateDebtor,
    private readonly createChatService: CreateChat,
    private readonly communicationService: Communication,
    private readonly validateScheduleService: ValidateScheduleConfig,
    private readonly costRepository: CostRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly chatRepository: ChatRepository
  ) {}

  async run(params: {
    emails: string[];
    row: WorkbookRow;
    idCompany: number;
    idClient: number;
    countryCode?: string;
  }): Promise<void> {
    console.log("We are preparing an email to send to a debtor...");

    let client: Client | null = null;
    const rowString = JSON.stringify(params.row);
    const company = await this.companyRepository.findById(params.idCompany);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    if (params.idClient) {
      client = await this.companyRepository.findClientById(params.idClient);
    }

    const isTimeToCommunicate = await this.validateScheduleService.run({
      idCompany: params.idCompany,
    });

    const from_email = company.email || "noreply@cobria.com";

    for (const email of params.emails) {
      if (!email) {
        continue;
      }

      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
      });

      // Create email message content
      const emailSubject = `Recordatorio de pago - ${company.companyName}`;
      const emailMessage = sendDebtMessage(
        params.row,
        gptPromptsJson.prompt_greeting,
        company.companyName
      );

      // Create a virtual phone number for email tracking (using company phone)
      const virtualPhoneNumber = company.cellphone || company.telephone || twilio_whatsapp_number;
      
      // Validate the virtual phone number
      if (!virtualPhoneNumber || isNaN(Number(virtualPhoneNumber))) {
        throw new httpError("Número de teléfono de la empresa no válido", 400);
      }

      await this.createChatService.run({
        idUser: params.idCompany,
        fromCellphone: Number(virtualPhoneNumber),
        toCellphone: 0, // Email doesn't have a phone number
        message: emailMessage,
      });

      if (!isTimeToCommunicate) {
        try {
          // Check if pending message already exists
          const existingMessage = await PendingMessage.findOne({
            where: {
              companyId: params.idCompany,
              phoneNumber: email,
              type: PendingMessageType.EMAIL,
              status: 'pending'
            }
          });
          
          if (!existingMessage) {
            const pendingMessage = PendingMessage.create({
              companyId: params.idCompany,
              phoneNumber: email, // Store email in phoneNumber field for pending messages
              message: "Se intentó enviar un email a un deudor fuera del horario permitido",
              type: PendingMessageType.EMAIL,
              fromNumber: from_email,
            });
            await this.companyRepository.addPendingMesage(pendingMessage);
          } else {
            console.log("Pending message already exists for this email.");
          }
        } catch (err) {
          console.log("Duplicating pending message.");
        }
        continue;
      }

      // Send email message
      const response = await this.communicationService.sendEmailMessage({
        idUser: params.idCompany,
        from: from_email,
        to: email,
        subject: emailSubject,
        message: emailMessage,
      });

      const cost = Cost.create({
        idCompany: params.idCompany,
        amount: response.cost || 0.001,
        type: CostType.EMAIL,
      });
      await this.costRepository.save(cost);

      if (response.message) {
        const chat = Chat.create({
          idUser: debtor.id_user,
          fromCellphone: Number(virtualPhoneNumber),
          toCellphone: 0, // Email doesn't have a phone number
          message: response.message || "",
        });
        await this.chatRepository.save(chat);
      }

      debtor.addEvent("Se contactó al deudor por email");
      await this.debtorRepository.save(debtor);

      console.log("Se procesó el email para el deudor", debtor.id);
    }
  }
}
