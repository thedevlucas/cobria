import { MongoRepository } from "../../../Shared/infrastructure/mongo/MongoRepository";
import { CallChat } from "../domain/CallChat";
import { CallChatRepository } from "../domain/CallChatRepository";

export class MongoCallChatRepository
  extends MongoRepository<CallChat>
  implements CallChatRepository
{
  protected collectionName(): string {
    return "call_chats";
  }

  async save(callChat: CallChat): Promise<void> {
    return this.persist(callChat.id, callChat);
  }

  async getCallChats(
    idUser: number,
    cellphone: number,
    onlyFunctionalChat = false
  ): Promise<CallChat[]> {
    const collection = await this.collection();

    const documents = await collection
      .find({
        $or: [
          {
            id_user: idUser,
            to_cellphone: cellphone,
          },
          {
            id_user: idUser,
            from_cellphone: cellphone,
          },
        ],
        status: onlyFunctionalChat ? true : { $exists: true },
      })
      .toArray();

    return documents.map((document: any) => {
      const callChat = CallChat.fromJSON({
        id_user: document.id_user,
        from_cellphone: document.from_cellphone,
        to_cellphone: document.to_cellphone,
        message: document.message,
        status: document.status,
      });

      callChat.setId(document._id.toString());

      return callChat;
    });
  }

  async deleteChat(idUser: number, cellphone: number): Promise<void> {
    const collection = await this.collection();
    const filter = {
      $or: [
        {
          id_user: idUser,
          to_cellphone: cellphone,
        },
        {
          id_user: idUser,
          from_cellphone: cellphone,
        },
      ],
    };

    await collection.deleteMany(filter);
  }
}
