// Models
import { CallChat } from "../../models/CallChat";
// Interfaces
import { ChatInterface } from "../../schemas/ChatSchema";

export async function createCallChat(chatInterface: ChatInterface) {
  const chat = await new CallChat(chatInterface);
  await chat.save();
  return { message: "Chat creado" };
}

export async function getCallChat(
  idUser: number,
  cellphone: number,
  onlyFunctionalChat: Boolean = false
) {
  const chats = await CallChat.find({
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
  });
  return chats;
}

export async function deleteCallChat(from: number, to: number) {
  await CallChat.deleteMany({
    from_cellphone: from,
    to_cellphone: to,
  });
  await CallChat.deleteMany({
    from_cellphone: from,
    to_cellphone: to,
  });
  return { message: "Chats eliminados" };
}
