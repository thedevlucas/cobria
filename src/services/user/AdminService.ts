// Models
import { User } from "../../models/User";
// Schema
import {
  createUserInterface,
  modifyUserInterface,
} from "../../schemas/UserSchema";
// Custom error
import { httpError } from "../../config/CustomError";
// Helpers
import { searchModel, compareSearchModel } from "../../helpers/SearchModel";
import { checkAdmin, hashPassword } from "../../helpers/user/UserHelper";
import { capitalizeWords, deleteBlankSpaces } from "../../helpers/FormatString";
import { Role } from "../../Contexts/BillingPlatform/company/domain/Company";

export async function getUsers() {
  const users = await User.findAll({
    order: [["id", "ASC"]],
  });
  (users || []).forEach((user: typeof User) => {
    user.dataValues.password = "";
  });
  return users;
}

export async function createUser(
  createUserInterface: createUserInterface,
  userId: number
) {
  // Search for the user who wants to create the new user
  const userAdmin = await User.findOne({ where: { id: userId } });
  // Change the user name
  createUserInterface.name = capitalizeWords(
    deleteBlankSpaces(createUserInterface.name)
  );
  // Check if the user already exists
  if (
    !(await searchModel(User, [
      { name: createUserInterface.name },
      { email: createUserInterface.email },
    ]))
  )
    throw new httpError("Este usuario ya existe", 400);
  if (createUserInterface.cellphone) {
    if (
      !(await searchModel(User, [{ cellphone: createUserInterface.cellphone }]))
    )
      throw new httpError("Este usuario ya existe", 400);
  }
  // Check permissions
  if (createUserInterface.role === Role.SUPERADMIN)
    throw new httpError("No tienes permisos para crear un superadmin", 400);

  if (!userAdmin) {
    throw new httpError(
      "No se encontró el usuario administrador durante la creación de un usuario",
      404
    );
  }

  if (userAdmin.role === Role.ADMIN && createUserInterface.role === Role.ADMIN)
    throw new httpError("No tienes permisos para crear un admin", 400);

  // Create the user
  await User.create({
    ...createUserInterface,
    password: hashPassword(createUserInterface.password),
  });
  return { message: "Usuario creado" };
}

export async function updateUser(
  id: number,
  modifyUserInterface: modifyUserInterface,
  userId: number
) {
  // Search for the user who wants to create the new user
  const userAdmin = await User.findOne({ where: { id: userId } });
  // Change the user name
  modifyUserInterface.name = capitalizeWords(
    deleteBlankSpaces(modifyUserInterface.name)
  );
  // Check if the user already exists
  if (
    !(await compareSearchModel(
      User,
      [
        { name: modifyUserInterface.name },
        { email: modifyUserInterface.email },
      ],
      id
    ))
  )
    throw new httpError("Este usuario ya existe", 400);
  if (modifyUserInterface.cellphone) {
    if (
      !(await compareSearchModel(
        User,
        [{ cellphone: modifyUserInterface.cellphone }],
        id
      ))
    )
      throw new httpError("Este usuario ya existe", 400);
  }
  const user = await User.findOne({ where: { id: id } });
  if (!userAdmin) {
    throw new httpError(
      "No se encontró el usuario administrador durante la actualización de un usuario",
      404
    );
  }
  if (!user) {
    throw new httpError(
      "No se encontró el usuario durante la actualización de un usuario",
      404
    );
  }
  // Check permissions
  if (userId != id) {
    if (userAdmin.role === Role.ADMIN && user.role != Role.USER)
      throw new httpError("No tienes permisos para modificar un admin", 400);
    if (modifyUserInterface.role === Role.SUPERADMIN)
      throw new httpError(
        "No tienes permisos para modificar un superadmin",
        400
      );
    if (userAdmin.role === Role.ADMIN && modifyUserInterface.role != Role.USER)
      throw new httpError("No tienes permisos para modificar un admin", 400);
  }
  if (userId == id) {
    if (userAdmin.role != modifyUserInterface.role)
      throw new httpError("No puedes modificar tu propio rol", 400);
    if (userAdmin.active != modifyUserInterface.active)
      throw new httpError("No puedes modificar tu propio estado", 400);
  }
  const updateData =
    modifyUserInterface.password != null
      ? {
          ...modifyUserInterface,
          password: hashPassword(modifyUserInterface.password),
        }
      : { ...modifyUserInterface, password: user.password };
  await user.update(updateData);
  return { message: "Usuario modificado" };
}

export async function deleteUser(id: number, userId: number) {
  // Search for the user who wants to create the new user
  const userAdmin = await User.findOne({ where: { id: userId } });
  if (!userAdmin) {
    throw new httpError(
      "No se encontró el usuario administrador durante la actualización de un usuario",
      404
    );
  }
  // Check if the user exists
  const user = await User.findOne({ where: { id: id } });
  if (!user) throw new httpError("Este usuario no existe", 400);
  // Check permissions
  if (userId === id)
    throw new httpError("No puedes eliminarte a ti mismo", 400);
  if (userAdmin.role === Role.ADMIN && user.role != Role.USER)
    throw new httpError("No tienes permisos para eliminar un admin", 400);
  await user.destroy();
  return { message: "Usuario eliminado" };
}

export async function changeStateUser(id: number, userId: number) {
  // Search for the user who wants to create the new user
  const userAdmin = await User.findOne({ where: { id: userId } });
  if (!userAdmin) {
    throw new httpError(
      "No se encontró el usuario administrador durante la actualización de un usuario",
      404
    );
  }
  // Check if the user exists
  const user = await User.findOne({ where: { id: id } });
  if (!user) throw new httpError("Este usuario no existe", 400);
  // Check permissions}
  if (userId === id)
    throw new httpError("No puedes cambiar tu propio estado", 400);
  if (userAdmin.role === "admin" && user.role != "user")
    throw new httpError(
      "No tienes permisos para cambiar el estado de un admin",
      400
    );
  await user.update({ active: !user.active });
  return { message: "Estado del usuario modificado" };
}
