// Models
import { debtImages } from "../../models/DebtImage";
// Schemas
import { debtImageInterface } from "../../schemas/DebtImageSchema";
// Errors
import { httpError } from "../../config/CustomError";

export async function createDebtImage(debtImageInterface: debtImageInterface) {
  return await debtImages.create(debtImageInterface);
}

export async function getDebtorImages(id_debtor: number) {
  const debtorImages = await debtImages.findAll({
    where: {
      id_debtor: id_debtor,
    },
  });
  return debtorImages;
}

export async function deleteDebtorImage(id: number) {
  const searchDebtorImage = await debtImages.findOne({ where: { id: id } });
  if (!searchDebtorImage) {
    throw new httpError("No se encontró la imagen", 404);
  }
  await searchDebtorImage.destroy();
  return { message: "Imagen eliminada" };
}
