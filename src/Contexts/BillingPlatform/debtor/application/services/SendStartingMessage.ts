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
import { AgentRepository } from "../../../agent/domain/AgentRepository";
import { httpError } from "../../../../../config/CustomError";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { Role } from "../../../company/domain/Company";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { Chat } from "../../../chat/domain/Chat";

export class SendStartingMessage {
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
    console.log("🚀 SendStartingMessage: Processing CSV row for debtor creation...");
    console.log(`📊 SendStartingMessage: Row data - Name: ${params.row.nombre}, Document: ${params.row.cedula}, Company: ${params.idCompany}`);

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

      // Validate that the telephone is a valid number
      if (!/^\d+$/.test(stringTelephoneToVerify)) {
        console.log(`⚠️ SendStartingMessage: Skipping invalid phone number: ${stringTelephoneToVerify}`);
        continue;
      }

      console.log(`👤 SendStartingMessage: Creating debtor for phone ${stringTelephoneToVerify}`);
      console.log(`📊 SendStartingMessage: Row data -`, JSON.stringify(params.row, null, 2));
      console.log(`📊 SendStartingMessage: Name: ${params.row.nombre}, Document: ${params.row.cedula}`);
      
      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
      });
      console.log(`✅ SendStartingMessage: Debtor created/retrieved - ID: ${debtor.id}, Name: ${debtor.name}`);

      let telephoneWithCountryCode = params.countryCode
        ? `${params.countryCode}${stringTelephoneToVerify}`
        : `${cellphoneInfo.country_code}${stringTelephoneToVerify}`;

      const numberTelephone = Number(telephoneWithCountryCode);

      // Validate the phone number before using it
      if (isNaN(numberTelephone)) {
        console.log(`Invalid phone number: ${telephoneWithCountryCode}`);
        continue;
      }

      const jsonContextMessage = `${rowString}
       ${gptPromptsJson.initial_json.parts[0].text}`;

      // If it is a cellphone
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
        message: jsonContextMessage,
      });

      if (!isTimeToCommunicate) {
        try {
          const pendingMessage = PendingMessage.create({
            companyId: params.idCompany,
            phoneNumber: telephoneWithCountryCode,
            message:
              "Se intentó enviar un mensaje a un deudor fuera del horario permitido",
            type: PendingMessageType.WHATSAPP,
            fromNumber: Number(from_telephone).toString(),
          });
          await this.companyRepository.addPendingMesage(pendingMessage);
        } catch (err) {
          console.log("Duplicating pending message.");
        }
        // continue;
      }

      // Send whatsapp message
      const response = await this.communicationService.sendFirstMessage({
        idUser: params.idCompany,
        companyName: company?.companyName,
        from: from_telephone,
        to: telephoneWithCountryCode,
        debtorName: params.row.nombre,
        client,
      });

      const cost = Cost.create({
        idCompany: params.idCompany,
        amount: response.cost || 0.0339,
        type: CostType.WHATSAPP,
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

      debtor.addEvent("Se contactó al deudor por whatsapp");
      await this.debtorRepository.save(debtor);

      console.log("Se proceso el mensaje de inicio para el deudor", debtor.id);
    }
  }
}
