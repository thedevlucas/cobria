import { Chat } from "./Chat";

export interface ChatRepository {
  save(chat: Chat): Promise<void>;
  getChats(
    idUser: number,
    cellphone: number,
    onlyFunctionalChat?: boolean
  ): Promise<Chat[]>;
  deleteChat(idUser: number, cellphone: number): Promise<void>;
}
