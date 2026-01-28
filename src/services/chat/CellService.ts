// Models
import { Cellphone } from "../../models/Cellphone";
import { User } from "../../models/User";
import { Debtor } from "../../models/Debtor";
import { database } from "../../config/Database";
import type { Transaction } from "sequelize";
// Schemas
import { cellphoneInterface } from "../../schemas/CellphoneSchema";
// Custom error
import { httpError } from "../../config/CustomError";
// Other services
import { deleteChat } from "./ChatService";
// Contexts
import { Role } from "../../Contexts/BillingPlatform/company/domain/Company"; 

export async function getCellphones(idUser: number) {
  const cellphones = await Debtor.findAll({
    where: { id_user: idUser },
    attributes: ["name", "id", "paid", "document"],
    include: [
      {
        model: Cellphone,
        as: "cellphones", 
        attributes: ["number", "from", "to", "id", "id_debtor"],
        required: false, // Correct: Keep false to see debtors without phones
      },
    ],
  });
  return cellphones;
}

export async function createCellphone(
  data: cellphoneInterface, 
  idUser: number
) {
  const { number, id_debtor, notes, country_code, phone_type } = data;

  const debtor = await Debtor.findOne({
    where: { 
      id: id_debtor, 
      id_user: idUser 
    },
  });

  if (!debtor) {
    throw new httpError("No se encontró el cliente o no tienes permisos", 404);
  }

  const existingCellphones = await Cellphone.findAll({
    where: { id_debtor: debtor.id },
  });

  const alreadyExistsSameNumber = existingCellphones.some(
    (c: any) => String(c.number) === String(number)
  );

  if (alreadyExistsSameNumber) {
    throw new httpError("Este número ya está registrado para este cliente", 400);
  }

  await database.transaction(async (transaction: Transaction) => {

    for (const oldCellphone of existingCellphones) {
      try {
        await deleteChat(
          idUser,
          Number((oldCellphone as any).from),
          Number((oldCellphone as any).to)
        );
      } catch (error) {
        console.log(
          "No se pudieron borrar los chats asociados al teléfono anterior, continuando..."
        );
      }

      await (oldCellphone as any).destroy({ transaction });
    }

    await Cellphone.create(
      {
        number: number,
        from: number,
        to: number,
        id_debtor: debtor.id,
      },
      { transaction }
    );
  });
  
  return { message: "Celular creado exitosamente" };
}

export async function deleteCellphone(id: number, idUser: number) {
  const userAction = await User.findByPk(idUser);

  const cellphone = await Cellphone.findByPk(id);
  if (!cellphone) throw new httpError("No se encontró el celular", 404);

  const debtor = await Debtor.findByPk(cellphone.id_debtor);
  
  if (debtor?.id_user !== idUser && userAction?.role === Role.USER) {
    throw new httpError("No tienes permisos para eliminar este celular", 403);
  }

  try {
      await deleteChat(
          idUser, 
          Number(cellphone.from), 
          Number(cellphone.to)
      ); 
  } catch (error) {
      console.log("No se pudieron borrar los chats asociados, continuando...");
  }

  await cellphone.destroy();
  
  return { message: "Celular eliminado correctamente" };
}
