// Models
import { Telephone } from "../../models/Telephone";
import { User } from "../../models/User";
import { Debtor } from "../../models/Debtor";
// Schemas
import { telephoneInterface } from "../../schemas/TelephoneSchema";
// Custom error
import { httpError } from "../../config/CustomError";
// Other services
import { deleteCallChat } from "./CallChatService";

export async function getTelephones(idUser: number) {
  const telephones = await Debtor.findAll({
    where: { id_user: idUser },
    attributes: ["name", "id"],
    include: [
      {
        model: Telephone,
        attributes: ["from", "to", "id"],
        required: true,
      },
    ],
  });
  return telephones;
}

export async function createTelephone(
  telephoneInterface: telephoneInterface,
  idUser: number
) {
  const searchDebtor = await Debtor.findOne({
    where: { document: telephoneInterface.document, id_user: idUser },
  });
  if (!searchDebtor) {
    throw new httpError("No se encontró el cliente", 404);
  }
  await Telephone.create({ ...telephoneInterface, id_debtor: searchDebtor.id });
  return { message: "Teléfono creado" };
}

export async function deleteTelephone(id: number, idUser: number) {
  const userAction = await User.findOne({ where: { id: idUser } });

  if (!userAction) {
    throw new httpError(
      "No se encontró el usuario al eliminar un teléfono",
      404
    );
  }

  const telephone = await Telephone.findOne({ where: { id: id } });
  if (!telephone) throw new httpError("No se encontró el teléfono", 404);

  const debtor = await Debtor.findOne({ where: { id: telephone.id_debtor } });

  if (!debtor) {
    throw new httpError(
      "No se encontró el deudor al eliminar un teléfono",
      404
    );
  }

  if (debtor.id_user != idUser && userAction.role === "user")
    throw new httpError("No tienes permisos para eliminar este teléfono", 403);

  // Delete telephone
  await telephone.destroy();
  // Delete call chats
  await deleteCallChat(telephone.from, telephone.to);
  return { message: "Teléfono eliminado" };
}
