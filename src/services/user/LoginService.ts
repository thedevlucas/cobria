// Dependencies
const jwt = require("jsonwebtoken");
// Models
import { User } from "../../models/User";
// Custom error
import { httpError } from "../../config/CustomError";
// Helpers
import { comparePassword } from "../../helpers/user/UserHelper";
// Env variables
import { jwt_key, jwt_expires_in } from "../../config/Constants";

export async function login(email:string,password:string){
    const searchUserEmail = await User.findOne({where:{email: email}});
    if(!searchUserEmail){
        throw new httpError("Credenciales invalidas",404);
    }
    const compare = await comparePassword(password,searchUserEmail.password);
    if(!compare){
        throw new httpError("Credenciales invalidas",400);
    }
    const id = searchUserEmail.id;
    const token = jwt.sign({ id }, jwt_key, { expiresIn: jwt_expires_in });
    return token;
}