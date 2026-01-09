import { CallChat } from "./CallChat";

export interface CallChatRepository {
  save(callChat: CallChat): Promise<void>;
  getCallChats(
    idUser: number,
    cellphone: number,
    onlyFunctionalChat?: boolean
  ): Promise<CallChat[]>;
  deleteChat(idUser: number, cellphone: number): Promise<void>;
}
