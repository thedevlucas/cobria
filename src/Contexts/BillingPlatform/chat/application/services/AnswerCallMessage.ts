import { CostRepository } from "../../../cost/domain/CostRepository";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { CallChat } from "../../domain/CallChat";
import { CallChatRepository } from "../../domain/CallChatRepository";
import { Communication } from "../../domain/Communication";

export class AnswerCallMessage {
  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly callChatRepository: CallChatRepository,
    private readonly costRepository: CostRepository,
    private readonly communicationService: Communication
  ) {}

  async run(params: {
    from: string;
    to: string;
    message: string;
    idUser?: number;
  }) {
    if (params.idUser) {
      const chat = CallChat.create({
        idUser: params.idUser,
        fromCellphone: Number(params.from),
        toCellphone: Number(params.to),
        message: params.message,
      });
      await this.callChatRepository.save(chat);
    }

    const response = await this.communicationService.answerCallMessage({
      message: params.message,
    });

    return response;
  }
}
