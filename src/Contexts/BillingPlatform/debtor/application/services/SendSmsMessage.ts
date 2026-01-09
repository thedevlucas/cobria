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
import {
  PendingMessage,
  PendingMessageType,
} from "../../../company/domain/PendingMessages";
import { httpError } from "../../../../../config/CustomError";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { Role } from "../../../company/domain/Company";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { Chat } from "../../../chat/domain/Chat";
import { sendDebtMessage } from "../../../../../helpers/chat/whatsapp/GPTHelper";

export class SendSmsMessage {
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
    telephones: string[] | number[];
    row: WorkbookRow;
    idCompany: number;
    idClient: number;
    countryCode?: string;
  }): Promise<void> {
    console.log("We are preparing an SMS to send to a debtor...");

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

    let from_telephone: string;
    
    if (company.role === Role.SUPERADMIN) {
      if (!twilio_whatsapp_number) {
        throw new httpError("Número de WhatsApp de Twilio no configurado", 400);
      }
      from_telephone = twilio_whatsapp_number.toString();
    } else {
      // Validate client phone number
      if (!client?.phone || isNaN(Number(client.phone))) {
        throw new httpError("Número de teléfono del cliente no válido", 400);
      }
      from_telephone = client.phone.toString();
    }

    // Validate the final phone number
    if (!from_telephone || from_telephone === "NaN" || isNaN(Number(from_telephone))) {
      throw new httpError("Número de teléfono no válido", 400);
    }

    for (const telephone of params.telephones) {
      if (!telephone) {
        continue;
      }

      const stringTelephoneToVerify = telephone.toString();

      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
      });

      let telephoneWithCountryCode = params.countryCode
        ? `${params.countryCode}${stringTelephoneToVerify}`
        : `${cellphoneInfo.country_code}${stringTelephoneToVerify}`;

      const numberTelephone = Number(telephoneWithCountryCode);

      // Validate the phone number before using it
      if (isNaN(numberTelephone)) {
        console.log(`Invalid phone number: ${telephoneWithCountryCode}`);
        continue;
      }

      // Create SMS message content
      const smsMessage = sendDebtMessage(
        params.row,
        gptPromptsJson.prompt_greeting,
        company.companyName
      );

      // Create the cellphone or search it
      const cellphoneExists = await this.debtorRepository.findByCellphone(
        Number(from_telephone),
        numberTelephone,
        params.idCompany
      );

      if (!cellphoneExists) {
        await createCellphone4Csv(
          debtor.id,
          Number(from_telephone),
          numberTelephone
        );
      }

      await this.createChatService.run({
        idUser: params.idCompany,
        fromCellphone: Number(from_telephone),
        toCellphone: numberTelephone,
        message: smsMessage,
      });

      if (!isTimeToCommunicate) {
        try {
          const pendingMessage = PendingMessage.create({
            companyId: params.idCompany,
            phoneNumber: telephoneWithCountryCode,
            message: "Se intentó enviar un SMS a un deudor fuera del horario permitido",
            type: PendingMessageType.SMS,
            fromNumber: Number(from_telephone).toString(),
          });
          await this.companyRepository.addPendingMesage(pendingMessage);
        } catch (err) {
          console.log("Duplicating pending message.");
        }
        continue;
      }

      // Send SMS message
      const response = await this.communicationService.sendSmsMessage({
        idUser: params.idCompany,
        from: from_telephone,
        to: telephoneWithCountryCode,
        message: smsMessage,
      });

      const cost = Cost.create({
        idCompany: params.idCompany,
        amount: response.cost || 0.0075,
        type: CostType.SMS,
      });
      await this.costRepository.save(cost);

      if (response.message) {
        const chat = Chat.create({
          idUser: debtor.id_user,
          fromCellphone: Number(from_telephone),
          toCellphone: Number(telephoneWithCountryCode),
          message: response.message || "",
        });
        await this.chatRepository.save(chat);
      }

      debtor.addEvent("Se contactó al deudor por SMS");
      await this.debtorRepository.save(debtor);

      console.log("Se procesó el SMS para el deudor", debtor.id);
    }
  }
}
