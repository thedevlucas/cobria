import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";

export class CreateChat {
  constructor(private readonly chatRepository: ChatRepository) {}

  async run(params: {
    idUser: number;
    fromCellphone: number;
    toCellphone: number;
    message: string;
  }) {
    const chat = Chat.create({
      idUser: params.idUser,
      fromCellphone: params.fromCellphone,
      toCellphone: params.toCellphone,
      message: params.message,
    });

    await this.chatRepository.save(chat);
  }
}
