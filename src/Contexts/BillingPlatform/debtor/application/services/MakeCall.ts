import {
  cellphoneInfo,
  gptPromptsJson,
  twilio_sms_number,
} from "../../../../../config/Constants";
import { sendDebtMessage } from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { Communication } from "../../../chat/domain/Communication";
import { WorkbookRow } from "../../domain/WorkbookProcessor";
import { CreateDebtor } from "../use-cases/CreateDebtor";
import { CreateCallChat } from "../../../chat/application/use-cases/CreateCallChat";
import { DebtorRepository } from "../../domain/DebtorRepository";
import { ValidateScheduleConfig } from "./ValidateScheduleConfig";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { Cost, CostType } from "../../../cost/domain/Cost";
import { createTelephone4Csv } from "../../../../../helpers/chat/whatsapp/WhatsAppHelper";
import {
  PendingMessage,
  PendingMessageType,
} from "../../../company/domain/PendingMessages";
import { CompanyRepository } from "../../../company/domain/CompanyRepository";
import { httpError } from "../../../../../config/CustomError";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { Role } from "../../../company/domain/Company";

export class MakeCall {
  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly createDebtorService: CreateDebtor,
    private readonly createCallChatService: CreateCallChat,
    private readonly communicationService: Communication,
    private readonly validateScheduleService: ValidateScheduleConfig,
    private readonly costRepository: CostRepository,
    private readonly companyRepository: CompanyRepository
  ) {}

  private cleanDigits(input: string): string {
    return (input || "").toString().replace(/\D/g, "");
  }

  private buildE164Like(params: {
    rawPhone: string;
    countryCode: string;
  }): string | null {
    const raw = this.cleanDigits(params.rawPhone);
    const cc = this.cleanDigits(params.countryCode);

    if (!raw) return null;

    const full = raw.startsWith(cc) ? raw : `${cc}${raw}`;

    // E.164 max without +
    if (full.length > 15) return null;
    if (full.length < 10) return null;

    return full;
  }

  async run(params: {
    telephones: string[] | number[];
    row: WorkbookRow;
    idCompany: number;
    agentName: string;
    agentPhoneNumber?: string;
    countryCode?: string;
  }): Promise<void> {
    console.log("We are preparing a call to a debtor...");

    const rowString = JSON.stringify(params.row);
    const company = await this.companyRepository.findById(params.idCompany);

    if (!company) {
      throw new CompanyNotFoundException();
    }

    let numberToBeUsedForCollection: string;
    
    if (company.role === Role.SUPERADMIN) {
      if (!twilio_sms_number) {
        throw new httpError("Número SMS de Twilio no configurado", 400);
      }
      numberToBeUsedForCollection = twilio_sms_number.toString();
    } else {
      // Validate agent phone number
      if (!params.agentPhoneNumber || isNaN(Number(params.agentPhoneNumber))) {
        throw new httpError("Número de teléfono del agente no válido", 400);
      }
      numberToBeUsedForCollection = params.agentPhoneNumber.toString();
    }

    // Validate the final phone number
    if (!numberToBeUsedForCollection || numberToBeUsedForCollection === "NaN" || isNaN(Number(numberToBeUsedForCollection))) {
      throw new httpError("Número de teléfono no válido", 400);
    }

    // validate schedule
    const isTimeToCommunicate = await this.validateScheduleService.run({
      idCompany: params.idCompany,
    });

    const cleanCountryCode =
      this.cleanDigits(params.countryCode?.toString() || "") ||
      this.cleanDigits(cellphoneInfo.country_code?.toString() || "") ||
      "54";

    for (const telephone of params.telephones) {
      if (!telephone) {
        continue;
      }

      const stringTelephoneToVerify = telephone.toString();
      const digitsOnly = this.cleanDigits(stringTelephoneToVerify);

      if (!digitsOnly) {
        console.log(`⚠️ MakeCall: skipping invalid destination: ${stringTelephoneToVerify}`);
        continue;
      }

      const telephoneWithCountryCode = this.buildE164Like({
        rawPhone: digitsOnly,
        countryCode: cleanCountryCode,
      });

      if (!telephoneWithCountryCode) {
        console.log(`⚠️ MakeCall: skipping destination by invalid E164 size: ${cleanCountryCode} + ${digitsOnly}`);
        continue;
      }

      const numberTelephone = Number(telephoneWithCountryCode);

      if (Number.isNaN(numberTelephone)) {
        console.log(`⚠️ MakeCall: skipping destination NaN after conversion: ${telephoneWithCountryCode}`);
        continue;
      }

      // creamos el deudor
      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
      });

      // construimos el contexto del deudor para la ia
      const jsonContextMessage = `${rowString}
       ${gptPromptsJson.initial_json.parts[0].text}`;

      // Mensaje que se enviara al deudor
      const message = sendDebtMessage(
        params.row,
        gptPromptsJson.prompt_greeting,
        params.agentName
      );

      // Creamos el telefono si no existe
      const telephoneExists = await this.debtorRepository.findByTelephone(
        Number(numberToBeUsedForCollection),
        numberTelephone,
        params.idCompany
      );

      if (!telephoneExists) {
        await createTelephone4Csv(
          debtor.id,
          Number(numberToBeUsedForCollection),
          numberTelephone
        );
      }

      // Saving first message
      await this.createCallChatService.run({
        idUser: params.idCompany,
        fromCellphone: Number(numberToBeUsedForCollection),
        toCellphone: numberTelephone,
        message: jsonContextMessage,
      });

      // Si el horario no es el adecuado, se guarda el mensaje en pendientes
      if (!isTimeToCommunicate) {
        try {
          const pendingMessage = PendingMessage.create({
            companyId: params.idCompany,
            phoneNumber: telephoneWithCountryCode,
            message: message,
            type: PendingMessageType.CALL,
            fromNumber: Number(numberToBeUsedForCollection).toString(),
          });
          await this.companyRepository.addPendingMesage(pendingMessage);
        } catch (err) {
          console.log("Duplicating pending message.");
        }
        continue;
      }

      // Se realiza la llamada
      await this.communicationService.makePhoneCall({
        from: Number(numberToBeUsedForCollection).toString(),
        to: numberTelephone.toString(),
        message,
        idUser: params.idCompany,
      });

      const cost = Cost.create({
        idCompany: params.idCompany,
        amount: 0.238,
        type: CostType.CALL,
      });

      await this.costRepository.save(cost);

      await this.createCallChatService.run({
        idUser: params.idCompany,
        fromCellphone: Number(numberToBeUsedForCollection),
        toCellphone: numberTelephone,
        message: message,
      });

      debtor.addEvent("Se contactó al deudor por llamada");
      await this.debtorRepository.save(debtor);

      console.log("Se proceso la llamada para el deudor", debtor.id);
    }
  }
}
