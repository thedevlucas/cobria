import { MongoRepository } from "../../../Shared/infrastructure/mongo/MongoRepository";
import { Chat } from "../domain/Chat";
import { ChatRepository } from "../domain/ChatRepository";

export class MongoChatRepository
  extends MongoRepository<Chat>
  implements ChatRepository
{
  protected collectionName(): string {
    return "chats";
  }

  async save(chat: Chat): Promise<void> {
    return this.persist(chat.id, chat);
  }

  async getChats(
    idUser: number,
    cellphone: number,
    onlyFunctionalChat = false
  ): Promise<Chat[]> {
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
      const chat = Chat.fromJSON({
        id_user: document.id_user,
        from_cellphone: document.from_cellphone,
        to_cellphone: document.to_cellphone,
        message: document.message,
        image: document.image,
        image_type: document.image_type,
        status: document.status,
      });

      chat.setId(document._id.toString());

      return chat;
    });
  }

  async deleteChat(idUser: number, cellphone: number): Promise<void> {
    const collection = await this.collection();
    const filter = {
      $or: [
        {
          id_user: idUser,
          from_cellphone: cellphone,
          to_cellphone: cellphone,
        },
        {
          id_user: idUser,
          from_cellphone: cellphone,
          to_cellphone: cellphone,
        },
      ],
    };

    await collection.deleteMany(filter);
  }
}
