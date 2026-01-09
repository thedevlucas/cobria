import { twilio_whatsapp_number } from "../../../../../config/Constants";
import { CallChat } from "../../../../../models/CallChat";
import { PendingMessageRepository } from "../../../company/domain/PendingMessageRepository";
import { PendingMessageStatus } from "../../../company/domain/PendingMessages";
import { Cost, CostType } from "../../../cost/domain/Cost";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { ValidateScheduleConfig } from "../../../debtor/application/services/ValidateScheduleConfig";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { CallChatRepository } from "../../domain/CallChatRepository";
import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";
import { Communication } from "../../domain/Communication";

export class ProcessPendingMessages {
  constructor(
    private readonly pendingMessageRepository: PendingMessageRepository,
    private readonly validateScheduleConfigService: ValidateScheduleConfig,
    private readonly communicationService: Communication,
    private readonly costRepository: CostRepository,
    private readonly debtorRepository: DebtorRepository,
    private readonly callChatRepository: CallChatRepository,
    private readonly chatRepository: ChatRepository
  ) {}

  async run() {
    const pendingMessages = await this.pendingMessageRepository.findAll();

    for (const pendingMessage of pendingMessages) {
      const isTimeToCommunicate = await this.validateScheduleConfigService.run({
        idCompany: pendingMessage.company_id,
      });

      if (!isTimeToCommunicate) {
        continue;
      }

      const debtor = await this.debtorRepository.findByCellphone(
        Number(pendingMessage.phone_number),
        pendingMessage.company_id
      );

      if (!debtor) {
        continue;
      }

      const fromNumber = pendingMessage.from_number;
      const toNumber = pendingMessage.phone_number;

      // process pending message
      if (pendingMessage.type === "whatsapp") {
        const response = await this.communicationService.sendFirstMessage({
          idUser: pendingMessage.company_id,
          from: fromNumber,
          to: toNumber,
          debtorName: debtor.name,
        });

        const cost = Cost.create({
          idCompany: pendingMessage.company_id,
          amount: response.cost || 0.0339,
          type: CostType.WHATSAPP,
        });
        await this.costRepository.save(cost);

        if (response.message) {
          const chat = Chat.create({
            idUser: debtor.id_user,
            fromCellphone: Number(fromNumber),
            toCellphone: Number(toNumber),
            message: response.message,
          });
          await this.chatRepository.save(chat);
        }
      } else if (pendingMessage.type === "call") {
        await this.communicationService.makePhoneCall({
          from: fromNumber,
          to: toNumber,
          message: pendingMessage.message,
          idUser: pendingMessage.company_id,
        });

        const cost = Cost.create({
          idCompany: pendingMessage.company_id,
          amount: 0.238,
          type: CostType.CALL,
        });

        await this.costRepository.save(cost);

        // Saving the call chat
        const callChat = CallChat.create({
          idUser: pendingMessage.company_id,
          fromCellphone: fromNumber,
          toCellphone: toNumber,
          message: pendingMessage.message,
        });

        await this.callChatRepository.save(callChat);
      }

      pendingMessage.updateStatus(PendingMessageStatus.SENT);

      await this.pendingMessageRepository.save(pendingMessage);
    }
  }
}
