import { excelColumns, gptPromptsJson, twilio_whatsapp_number } from "../../../../../config/Constants";
import { CompanyNotFoundException } from "../../../company/domain/exceptions/CompanyNotFound";
import { CompanyExistById } from "../../../company/domain/services/CompanyExistById";
import { WorkbookToJson } from "../services/WorkbookToJson";
import { CreateDebtor } from "./CreateDebtor";
import { PendingMessageRepository } from "../../../company/domain/PendingMessageRepository";
import { sendDebtMessage } from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { PendingMessage, PendingMessageStatus, PendingMessageType } from "../../../company/domain/PendingMessages";
import { AgentRepository } from "../../../agent/domain/AgentRepository";
import { CellphoneRepository } from "../../domain/CellphoneRepository";
import { Cellphone } from "../../domain/Cellphone";
import { ChatRepository } from "../../../chat/domain/ChatRepository";
import { Chat } from "../../../chat/domain/Chat";

export class ProcessWorkbook {
  private readonly columnsConfig: Record<string, any>;

  constructor(
    private readonly workbookToJsonService: WorkbookToJson,
    private readonly createDebtor: CreateDebtor,
    private readonly pendingMessageRepository: PendingMessageRepository,
    private readonly companyExistById: CompanyExistById,
    private readonly agentRepository: AgentRepository,       // 5. Agentes
    private readonly cellphoneRepository: CellphoneRepository, // 6. Celulares
    private readonly chatRepository: ChatRepository          // 7. Chats (ESTE ES EL QUE FALTABA EN TU CONSTRUCTOR)
  ) {
    this.columnsConfig = JSON.parse(excelColumns());
  }

  async run(params: { workbook: any; idCompany: number; idClient: number; countryCode?: string }): Promise<void> {
    const companyExist = await this.companyExistById.run({ companyId: params.idCompany });
    if (!companyExist) throw new CompanyNotFoundException();

    const workbookJson = await this.workbookToJsonService.run(params.workbook, this.columnsConfig);
    const agents = await this.agentRepository.findByIdCompany(params.idCompany);
    const concurrency = agents && agents.length > 0 ? agents.length : 1;
    const SECONDS_BETWEEN_MESSAGES = 15;

    let scheduledCount = 0;
    const now = new Date();
    const fromNum = Number((twilio_whatsapp_number || "").replace(/\D/g, ""));

    for (const row of workbookJson) {
      try {
        const keys = Object.keys(row);
        const nameKey = keys.find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name') || k.toLowerCase().includes('cliente'));
        const docKey = keys.find(k => k.toLowerCase().includes('cedula') || k.toLowerCase().includes('dni') || k.toLowerCase().includes('document'));
        const debtorName = nameKey ? row[nameKey] : "Cliente";
        const document = docKey ? Number(row[docKey]) : 0;

        if (!document) continue;

        const debtor = await this.createDebtor.run({
          name: debtorName,
          document: document,
          idUser: params.idCompany,
          debtDate: row.fecha_deuda
        });

        const telephoneKeyNames = keys.filter((key) => {
          const lowerKey = key.toLowerCase();
          const telephoneKeywords = this.columnsConfig.telephone_alternatives || [this.columnsConfig.telephone];
          return telephoneKeywords.some((keyword: string) => lowerKey.includes(keyword.toLowerCase()));
        });
        const telephones = telephoneKeyNames.map((key) => row[key]);

        for (const phone of telephones) {
          if (!phone) continue;
          const cleanPhone = String(phone).replace(/\D/g, "");
          if (cleanPhone.length < 7 || cleanPhone.length > 15) continue;

          const finalPhone = (params.countryCode) + cleanPhone;
          const finalPhoneNum = Number(finalPhone);

          try {
            const cellphone = Cellphone.create({
              from: fromNum,
              to: finalPhoneNum,   
              number: finalPhoneNum,
              id_debtor: debtor.id!
            });
            await this.cellphoneRepository.save(cellphone);
          } catch (e) { console.log("❌ Error guardando celular", e); }

          try {
            const chatContext = Chat.create({
              idUser: params.idCompany,
              fromCellphone: fromNum,
              toCellphone: finalPhoneNum, 
              message: `[AI_CONTEXT_INTERNAL]${JSON.stringify(row)}[/AI_CONTEXT_INTERNAL]`
            });
            await this.chatRepository.save(chatContext);
          } catch (e) { console.error("Error guardando chat mongo", e); }

          let messageBody = sendDebtMessage(row, gptPromptsJson.prompt_greeting);
          if (messageBody && messageBody.includes("${debtorName}")) {
             messageBody = messageBody.replace(/\$\{debtorName\}/g, debtorName);
          }

          const batchIndex = Math.floor(scheduledCount / concurrency);
          const delayInSeconds = batchIndex * SECONDS_BETWEEN_MESSAGES;
          const scheduledDate = new Date(now.getTime() + (delayInSeconds * 1000));

          const pendingMsg = PendingMessage.create({
            companyId: params.idCompany,
            phoneNumber: finalPhone,
            message: messageBody,
            type: PendingMessageType.WHATSAPP,
            fromNumber: String(fromNum),
            scheduledAt: scheduledDate
          });

          await this.pendingMessageRepository.save(pendingMsg);
          scheduledCount++;
        }
      } catch (error) {
        console.error(`❌ Error fila:`, error);
      }
    }
  }
}