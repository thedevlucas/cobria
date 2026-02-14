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

export async function validateDebtImage(id: number, isApproved: boolean) {
  const image = await debtImages.findOne({ where: { id: id } });
  if (!image) throw new httpError("Imagen no encontrada", 404);

  if (isApproved) {
    image.type = 'Paid';
    await image.save();
    // Opcional: Aquí podrías actualizar también el estado del deudor a 'Paid'
    const { Debtor } = require("../../models/Debtor");
    await Debtor.update({ paid: 'Paid' }, { where: { id: image.id_debtor } });
    return { message: "Pago validado correctamente" };
  } else {
    await image.destroy(); // Si se rechaza, podemos eliminarla o marcarla como rechazada
    return { message: "Comprobante rechazado" };
  }
}