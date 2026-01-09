// Models
import { twilio_whatsapp_number } from "../../config/Constants";
import { Chat } from "../../models/Chat";
// Interfaces
import { ChatInterface } from "../../schemas/ChatSchema";

export async function createChat(chatInterface: ChatInterface) {
  const chat = await new Chat(chatInterface);
  await chat.save();
  return { message: "Chat creado" };
}

export async function getChats(
  idUser: number,
  cellphone: number,
  onlyFunctionalChat: Boolean = false
) {
  const chats = await Chat.find({
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

export async function deleteChat(idUser: number, from: number, to: number) {
  await Chat.deleteMany({
    id_user: idUser,
    from_cellphone: from,
    to_cellphone: to,
  });
  return { message: "Chats eliminados" };
}
