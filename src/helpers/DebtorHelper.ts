// Models
import { User } from "../models/User";
import { Debtor } from "../models/Debtor";
import { Cellphone } from "../models/Cellphone";
// Dependencies
import { Op } from "sequelize";

export async function searchDebtorWithCellphones(
  from_cellphone: number,
  to_cellphone: number
) {
  const cellphone = await Cellphone.findOne({
    where: {
      [Op.or]: [
        { number: from_cellphone },
        { number: to_cellphone }
      ]
    },

    include: [
      {
        model: Debtor,
        as: "debtor"
      }
    ]
  });

  return cellphone?.debtor || null;
}

export async function updatePaidStatus(debtor: any, newStatus: string) {
  await debtor.update({ paid: newStatus });
}