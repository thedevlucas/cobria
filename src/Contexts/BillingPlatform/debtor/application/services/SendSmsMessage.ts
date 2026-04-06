import {
  cellphoneInfo,
  gptPromptsJson,
  twilio_sms_number,
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
    const company = await this.companyRepository.findById(params.idCompany);
    if (!company) throw new CompanyNotFoundException();

    let client: Client | null = null;
    if (params.idClient) {
      client = await this.companyRepository.findClientById(params.idClient);
    }

    const isTimeToCommunicate = await this.validateScheduleService.run({
      idCompany: params.idCompany,
    });

    let from_telephone: string;
    if (company.role === Role.SUPERADMIN) {
      if (!twilio_sms_number) {
        throw new httpError("El número de Twilio SMS no está configurado", 400);
      }
      from_telephone = twilio_sms_number.toString();
    } else {
      if (!client?.phone) throw new httpError("Teléfono de cliente no configurado", 400);
      from_telephone = client.phone.toString();
    }

    for (const telephone of params.telephones) {
      if (!telephone) continue;

      // 1. FILTRO DE LONGITUD (Como en WhatsApp): Evita IDs largos o números basura del Excel
      const stringTelephoneVerify = telephone.toString().replace(/\D/g, '');;
      if (stringTelephoneVerify.length > cellphoneInfo.cellphone_length) {
        console.log(`Número descartado por longitud incorrecta: ${stringTelephoneVerify}`);
        continue;
      }

      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
        channel: 'sms',
      });

      // Mantenemos el string para el envío por API
      let telephoneWithCountryCode = params.countryCode
        ? `${params.countryCode}${telephone}`
        : `${cellphoneInfo.country_code}${telephone}`;

      // 2. PARCHE MANUAL DEL NOMBRE: Replicamos la lógica de WhatsApp para procesar ${debtorName}
      let smsMessage = sendDebtMessage(params.row, gptPromptsJson.prompt_greeting, company.companyName);
      
      if (smsMessage && smsMessage.includes("${debtorName}")) {
        smsMessage = smsMessage.replace(/\$\{debtorName\}/g, params.row.nombre || "Cliente");
      }

      // 3. PERSISTENCIA CON CONVERSIÓN A NUMBER (Para evitar errores de TypeScript)
      // Usamos Number() aquí porque el filtro de longitud ya garantizó que no sea un ID gigante
      const cellphoneExists = await this.debtorRepository.findByCellphone(
        Number(from_telephone), 
        Number(telephoneWithCountryCode), 
        params.idCompany
      );
      
      if (!cellphoneExists) {
        await createCellphone4Csv(debtor.id, Number(from_telephone), Number(telephoneWithCountryCode));
      }

      await this.chatRepository.save(Chat.create({
        idUser: params.idCompany,
        fromCellphone: Number(from_telephone),
        toCellphone: Number(telephoneWithCountryCode),
        message: smsMessage,
        channel: 'sms'
      }));

      // 4. VALIDACIÓN DE HORARIO
      if (!isTimeToCommunicate) {
        const pendingMessage = PendingMessage.create({
          companyId: params.idCompany,
          phoneNumber: telephoneWithCountryCode,
          message: smsMessage,
          type: PendingMessageType.SMS,
          fromNumber: from_telephone,
        });
        await this.companyRepository.addPendingMesage(pendingMessage);
        continue; 
      }

      // 5. ENVÍO REAL Y REGISTRO DE COSTO
      try {
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

        debtor.addEvent("Se contactó al deudor por SMS");
        await this.debtorRepository.save(debtor);
      } catch (error) {
        console.error("Error al enviar SMS mediante Twilio:", error);
      }
    }
  }
}