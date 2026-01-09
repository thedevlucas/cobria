import { CallChat } from "../../domain/CallChat";
import { CallChatRepository } from "../../domain/CallChatRepository";

export class CreateCallChat {
  constructor(private readonly callChatRepository: CallChatRepository) {}

  async run(params: {
    idUser: number;
    fromCellphone: number;
    toCellphone: number;
    message: string;
  }) {
    const callChat = CallChat.create({
      idUser: params.idUser,
      fromCellphone: params.fromCellphone,
      toCellphone: params.toCellphone,
      message: params.message,
    });

    await this.callChatRepository.save(callChat);
  }
}
