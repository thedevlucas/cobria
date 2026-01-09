import { Chat } from "../../domain/Chat";
import { ChatRepository } from "../../domain/ChatRepository";

export class GetChatsByUser {
  constructor(private readonly repository: ChatRepository) {}

  async run(params: { idUser: number; cellphone: number }): Promise<Chat[]> {
    return await this.repository.getChats(params.idUser, params.cellphone);
  }
}
