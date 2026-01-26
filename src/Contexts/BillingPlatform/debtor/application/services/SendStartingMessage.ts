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

  private cleanDigits(input: string): string {
    return (input || "").toString().replace(/\D/g, "");
  }

  private buildE164Like(params: {
    rawPhone: string;
    countryCode: string;
  }): string | null {
    const raw = this.cleanDigits(params.rawPhone);
    const cc = this.cleanDigits(params.countryCode);

    // si está vacío o no numérico
    if (!raw) return null;

    // WhatsApp/E.164: máximo 15 dígitos (sin el +)
    // si ya viene internacional (ej: arranca con countryCode) no lo duplicamos
    let full = raw.startsWith(cc) ? raw : `${cc}${raw}`;

    // regla dura: si supera 15 dígitos, NO es whatsapp (ej. tarjeta 16 dígitos)
    if (full.length > 15) return null;

    // demasiado corto
    if (full.length < 10) return null;

    return full;
  }

  async run(params: {
    telephones: string[] | number[];
    row: WorkbookRow;
    idCompany: number;
    idClient: number;
    countryCode?: string;
  }): Promise<void> {
    console.log("🚀 SendStartingMessage: Processing CSV row for debtor creation...");
    console.log(
      `📊 SendStartingMessage: Row data - Name: ${params.row.nombre}, Document: ${params.row.cedula}, Company: ${params.idCompany}`
    );

    let client: Client | null = null;
    const rowString = JSON.stringify(params.row);

    const company = await this.companyRepository.findById(params.idCompany);
    if (!company) throw new CompanyNotFoundException();

    if (params.idClient) {
      client = await this.companyRepository.findClientById(params.idClient);
    }

    const isTimeToCommunicate = await this.validateScheduleService.run({
      idCompany: params.idCompany,
    });

    // FROM number (prioridad: client.phone -> TWILIO)
    let from_telephone: string;

    if (
      client?.phone &&
      !isNaN(Number(client.phone)) &&
      client.phone.toString().trim() !== ""
    ) {
      from_telephone = this.cleanDigits(client.phone.toString());
      console.log(`📱 SendStartingMessage: Using client phone number: ${from_telephone}`);
    } else if (twilio_whatsapp_number) {
      from_telephone = this.cleanDigits(twilio_whatsapp_number.toString());
      console.log(`📱 SendStartingMessage: Using Twilio WhatsApp number: ${from_telephone}`);
    } else {
      throw new httpError(
        "No hay número configurado para enviar mensajes. Configure TWILIO_WHATSAPP_NUMBER o asigne un cliente con teléfono válido.",
        400
      );
    }

    if (!from_telephone || from_telephone.length < 8) {
      throw new httpError("Número de teléfono de origen no válido", 400);
    }

    const cleanCountryCode =
      this.cleanDigits(params.countryCode?.toString() || "") ||
      this.cleanDigits(cellphoneInfo.country_code?.toString() || "") ||
      "54";

    for (const tel of params.telephones) {
      if (!tel) continue;

      const rawTel = tel.toString();
      const onlyDigits = this.cleanDigits(rawTel);

      // si no es numérico
      if (!onlyDigits) {
        console.log(`⚠️ SendStartingMessage: Skipping invalid phone number: ${rawTel}`);
        continue;
      }

      // si parece tarjeta u otra cosa (16+), skip
      if (onlyDigits.length > 15) {
        console.log(`⚠️ SendStartingMessage: Skipping phone number by length (>15): ${onlyDigits}`);
        continue;
      }

      const telephoneWithCountryCode = this.buildE164Like({
        rawPhone: onlyDigits,
        countryCode: cleanCountryCode,
      });

      if (!telephoneWithCountryCode) {
        console.log(`⚠️ SendStartingMessage: Invalid destination after formatting: ${cleanCountryCode} + ${onlyDigits}`);
        continue;
      }

      console.log(`👤 SendStartingMessage: Creating debtor for phone ${telephoneWithCountryCode}`);
      console.log(`📊 SendStartingMessage: Name: ${params.row.nombre}, Document: ${params.row.cedula}`);

      const debtor = await this.createDebtorService.run({
        name: params.row.nombre,
        document: params.row.cedula,
        idUser: params.idCompany,
        debtDate: params.row.fecha_deuda,
      });

      console.log(`✅ SendStartingMessage: Debtor created/retrieved - ID: ${debtor.id}, Name: ${debtor.name}`);

      // Guardamos contexto IA como mensaje "interno" (luego lo filtrás en frontend)
      const aiContextMessage = `[AI_CONTEXT_INTERNAL]${rowString}[/AI_CONTEXT_INTERNAL]`;

      // IMPORTANTE: convertimos a Number SOLO si ya validamos <= 15 dígitos
      const fromNum = Number(from_telephone);
      const toNum = Number(telephoneWithCountryCode);

      if (Number.isNaN(fromNum) || Number.isNaN(toNum)) {
        console.log(`⚠️ SendStartingMessage: NaN after conversion - from:${from_telephone} to:${telephoneWithCountryCode}`);
        continue;
      }

      const cellphoneExists = await this.debtorRepository.findByCellphone(
        fromNum,
        toNum,
        params.idCompany
      );

      if (!cellphoneExists) {
        await createCellphone4Csv(debtor.id, fromNum, toNum);
      }

      await this.createChatService.run({
        idUser: params.idCompany,
        fromCellphone: fromNum,
        toCellphone: toNum,
        message: aiContextMessage,
      });

      if (!isTimeToCommunicate) {
        try {
          const pendingMessage = PendingMessage.create({
            companyId: params.idCompany,
            phoneNumber: telephoneWithCountryCode,
            message: "Se intentó enviar un mensaje a un deudor fuera del horario permitido",
            type: PendingMessageType.WHATSAPP,
            fromNumber: from_telephone,
          });
          await this.companyRepository.addPendingMesage(pendingMessage);
        } catch (err) {
          console.log("Duplicating pending message.");
        }
        continue; // ✅ esto es CLAVE
      }

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
          fromCellphone: fromNum,
          toCellphone: toNum,
          message: response.message || "",
        });
        await this.chatRepository.save(chat);
      }

      debtor.addEvent("Se contactó al deudor por whatsapp");
      await this.debtorRepository.save(debtor);

      console.log("✅ Se procesó el mensaje de inicio para el deudor", debtor.id);
    }
  }
}
