// Dependencies
const jwt = require("jsonwebtoken");
// Models
import { User } from "../../models/User";
// Custom error
import { httpError } from "../../config/CustomError";
// Env variables
import { jwt_key, frontend_host, email } from "../../config/Constants";
// Email
import { transportMail } from "../../config/Email";
// Helpers
import { hashPassword } from "../../helpers/user/UserHelper";

export async function sendRecoveryLink(email: string) {
  const searchUserEmail = await User.findOne({ where: { email: email } });
  if (!searchUserEmail) {
    throw new httpError("No se encontró el usuario", 404);
  }
  const token = jwt.sign({ id: searchUserEmail.id }, jwt_key, {
    expiresIn: "15m",
  });
  return `${frontend_host}/password-recovery/${token}`;
}

export async function sendRecoveryEmail(toEmail: string, link: string) {
  await transportMail.sendMail({
    from: email,
    to: toEmail,
    subject: "Recuperación de contraseña",
    html: `
        Haga clic en el siguiente enlace para iniciar el proceso de recuperación de contraseña: <a href=${link}>Click para recuperar su contraseña</a>
        `,
  });
}

export async function recoverPassword(token: string, newPassword: string) {
  const payload = jwt.verify(token, jwt_key);
  if (!payload.id) {
    throw new httpError("Link invalido", 400);
  }
  const userId = await User.findOne({ where: { id: payload.id } });
  if (!userId) {
    throw new httpError("Usuario no encontrado", 404);
  }
  await userId.update({
    password: hashPassword(newPassword),
  });
  return { message: "Contraseña actualizada" };
}
