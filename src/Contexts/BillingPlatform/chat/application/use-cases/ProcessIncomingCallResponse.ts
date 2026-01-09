import {
  getContextMessages,
  sendContextMessage,
} from "../../../../../helpers/chat/whatsapp/GPTHelper";
import { getPaymentMessage } from "../../../../../helpers/chat/whatsapp/PaymentHelper";
import { CostRepository } from "../../../cost/domain/CostRepository";
import { PaymentStatus } from "../../../debtor/domain/Debtor";
import { DebtorRepository } from "../../../debtor/domain/DebtorRepository";
import { CallChat } from "../../domain/CallChat";
import { CallChatRepository } from "../../domain/CallChatRepository";
import { Communication } from "../../domain/Communication";
import { AnswerCallMessage } from "../services/AnswerCallMessage";

export class ProcessIncomingCallResponse {
  private readonly answerCallMessageService: AnswerCallMessage;

  constructor(
    private readonly debtorRepository: DebtorRepository,
    private readonly callChatRepository: CallChatRepository,
    private readonly costRepository: CostRepository,
    private readonly communicationService: Communication
  ) {
    this.answerCallMessageService = new AnswerCallMessage(
      this.debtorRepository,
      this.callChatRepository,
      this.costRepository,
      this.communicationService
    );
  }
  // answering a AI response to call incoming.
  async run(params: { fromNumber: string; toNumber: string; message: string }) {
    console.table({
      type: "incomming-call",
      fromNumber: params.fromNumber,
      toNumber: params.toNumber,
      message: params.message,
    });

    const debtorNumber = this.removePrefix(params.fromNumber);
    const toNumber = this.removePrefix(params.toNumber);
    let debtor = null;

    try {
      debtor = await this.debtorRepository.findByTelephone(
        Number(toNumber),
        Number(debtorNumber)
      );

      if (!debtor) {
        throw new Error("Debtor not found");
      }

      const chat = CallChat.create({
        idUser: debtor.id_user,
        fromCellphone: Number(debtorNumber),
        toCellphone: Number(toNumber),
        message: params.message,
      });

      await this.callChatRepository.save(chat);

      const userMessagesHistory = await getContextMessages(
        debtor.id_user,
        Number(debtorNumber),
        "call"
      );
      const botResponse = await sendContextMessage(userMessagesHistory);

      const botResponseFormatted = this.formatBotResponse(
        botResponse,
        debtor.name
      );

      debtor.addEvent(botResponseFormatted.actionRecord);

      debtor.updateStatus(botResponseFormatted.status as PaymentStatus);

      const paymentMessage = await getPaymentMessage(
        Number(toNumber),
        Number(debtorNumber),
        userMessagesHistory,
        debtor,
        "call"
      );

      const whatsappResponse =
        paymentMessage || botResponseFormatted.userResponse;

      const response = await this.answerCallMessageService.run({
        from: toNumber,
        to: debtorNumber,
        message: whatsappResponse,
        idUser: debtor.id_user,
      });

      await this.debtorRepository.save(debtor);

      return response;
    } catch (err) {
      console.log("Error: ", err);
      const response = await this.answerCallMessageService.run({
        from: toNumber,
        to: debtorNumber,
        message: "Se produjo un error durante la llamada.",
        idUser: debtor?.id_user,
      });
      return response;
    }
  }

  private removePrefix(number: string): string {
    const prefix = "+";

    return number.startsWith(prefix) ? number.replace(prefix, "") : number;
  }

  private formatBotResponse(
    botResponse: string,
    debtorName: string
  ): {
    userResponse: string;
    actionRecord: string;
    status: string;
  } {
    return JSON.parse(
      botResponse
        .replace(/```json|```/g, "")
        .trim()
        .replace("[Nombre del deudor]", debtorName)
    );
  }
}
