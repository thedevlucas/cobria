// Dependencies
import { Sequelize } from "sequelize";
// Models
import { Debtor } from "../../models/Debtor";
import { User } from "../../models/User";
// Custom error
import { httpError } from "../../config/CustomError";
// Schemas
import {
  createDebtorInterface,
  modifyDebtorInterface,
} from "../../schemas/DebtorSchema";
// Helpers
import { capitalizeWords, deleteBlankSpaces } from "../../helpers/FormatString";
import { TypeOrmClientFactory } from "../../Contexts/Shared/infrastructure/typeorm/TypeOrmClientFactory";
import { databaseConfigProps } from "../../config/Database";
import { TypeOrmDebtorRepository } from "../../Contexts/BillingPlatform/debtor/infrastructure/typeorm/TypeOrmDebtorRepository";
import { CreateDebtor } from "../../Contexts/BillingPlatform/debtor/application/use-cases/CreateDebtor";
import { Role } from "../../Contexts/BillingPlatform/company/domain/Company";

const datasourceDebtor = TypeOrmClientFactory.createClient(
  "debtor",
  databaseConfigProps
);

const debtorRepository = new TypeOrmDebtorRepository(datasourceDebtor);

export async function getDebtors(idUser: number) {
  const userAction = await User.findOne({ where: { id: idUser } });

  const debtors = await Debtor.findAll({
    raw: true,
    where: userAction?.role === "user" ? { id_user: idUser } : {},
    attributes: [
      "id",
      [Sequelize.col("user.email"), "user_email"], // Owner's email (for reference)
      "email", // Debtor's contact email
      "name",
      "document",
      "paid",
      "events",
    ],
    include: [
      {
        model: User,
        attributes: [],
        required: true,
      },
    ],
  });

  return debtors;
}

export async function deleteDebtors(id: number, idUser: number) {
  const userAction = await User.findOne({ where: { id: idUser } });

  const debtor = await Debtor.findOne({ where: { id: id } });
  if (!debtor) throw new httpError("No se encontró el cliente", 404);
  if (userAction?.role === Role.USER && debtor.id_user != idUser)
    throw new httpError("No tienes permisos para eliminar este cliente", 403);
  await debtor.destroy();
  return { message: "Cliente eliminado" };
}

export async function createDebtor(
  createDebtorInterface: createDebtorInterface,
  idUser: number
) {
  // Change the debtor name
  createDebtorInterface.name = capitalizeWords(
    deleteBlankSpaces(createDebtorInterface.name)
  );
  
  // Verify the user making the action exists
  const userAction = await User.findOne({ where: { id: idUser } });
  if (!userAction) {
    throw new httpError("Usuario no encontrado", 404);
  }

  // If the user provides an email, it's for debtor contact purposes (NOT to find a User)
  // The debtor belongs to the authenticated user (idUser)
  
  // For regular users, they can only create debtors for themselves
  // For admins, they need to specify which user the debtor belongs to
  let targetUserId = idUser;
  
  // If email is provided and user is admin, try to find the target user
  if (createDebtorInterface.email && userAction.role !== Role.USER) {
    const targetUser = await User.findOne({
      where: { email: createDebtorInterface.email },
    });
    if (targetUser) {
      targetUserId = targetUser.id;
    }
    // If not found, still use the authenticated user
  }
  
  // Check if debtor already exists for this user
  const searchDebtor = await Debtor.findOne({
    where: { document: createDebtorInterface.document, id_user: targetUserId },
  });
  
  if (searchDebtor) {
    throw new httpError("Este deudor ya existe", 400);
  }

  // Create the debtor with email
  const debtorData: any = {
    name: createDebtorInterface.name,
    document: createDebtorInterface.document,
    idUser: targetUserId,
  };
  
  // Add email if provided
  if (createDebtorInterface.email) {
    debtorData.email = createDebtorInterface.email;
  }

  const createDebtorUseCase = new CreateDebtor(debtorRepository);
  const debtor = await createDebtorUseCase.run(debtorData);

  return debtor;
}

export async function modifyDebtor(
  id: number,
  modifyDebtorInterface: modifyDebtorInterface,
  idUser: number
) {
  // Change the debtor name
  modifyDebtorInterface.name = capitalizeWords(
    deleteBlankSpaces(modifyDebtorInterface.name)
  );
  
  // Search the user making the action
  const userAction = await User.findOne({ where: { id: idUser } });
  if (!userAction) {
    throw new httpError("Usuario no encontrado", 404);
  }
  
  // Search the debtor to modify
  const debtor = await Debtor.findOne({ where: { id: id } });
  if (!debtor) {
    throw new httpError("No se encontró el deudor", 404);
  }
  
  // Check permissions - regular users can only modify their own debtors
  if (userAction.role === Role.USER && debtor.id_user !== idUser) {
    throw new httpError("No tienes permisos para modificar este deudor", 403);
  }
  
  // Check if another debtor with the same document already exists
  const searchDebtor = await Debtor.findOne({
    where: { 
      document: modifyDebtorInterface.document, 
      id_user: debtor.id_user // Keep same user ownership
    },
  });
  
  if (searchDebtor && searchDebtor.id !== id) {
    throw new httpError("Ya existe otro deudor con este documento", 400);
  }
  
  // Update the debtor (keep the same id_user ownership)
  const updateData: any = {
    name: modifyDebtorInterface.name,
    document: modifyDebtorInterface.document,
    paid: modifyDebtorInterface.paid,
    // Don't change id_user - debtor stays with original owner
  };
  
  // Update email if provided
  if (modifyDebtorInterface.email !== undefined) {
    updateData.email = modifyDebtorInterface.email;
  }
  
  await debtor.update(updateData);
  
  return { message: "Deudor modificado correctamente" };
}
