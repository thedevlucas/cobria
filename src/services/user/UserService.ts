// Models
import { User } from "../../models/User";
// Helpers
import { comparePassword, hashPassword } from "../../helpers/user/UserHelper";
// Custom error
import { httpError } from "../../config/CustomError";

export async function changePassword(id:number, oldPassword:string, newPassword:string){
    const user = await User.findOne({where:{id:id}});
    if(!user) throw new httpError("Usuario no encontrado",404);
    if(!comparePassword(oldPassword,user.password)) throw new httpError("Credenciales incorrectas",400)
    await user.update({password:hashPassword(newPassword)});
    return {message:"Contraseña actualizada"};
}

export async function getName(id:number){
    const user = await User.findOne({where:{id:id}});
    if(!user) throw new httpError("Usuario no encontrado",404);
    return {name:user.name};
}   

export async function getCellphone(id:number){
    const user = await User.findOne({where:{id:id}});
    if(!user) throw new httpError("Usuario no encontrado",404);
    return {cellphone:user.cellphone};
}

export async function deleteSelf(id:number){
    const user = await User.findOne({where:{id:id}});
    if(!user) throw new httpError("Usuario no encontrado",404);
    await user.destroy();
}

export async function getTelephone(id:number){
    const user = await User.findOne({where:{id:id}});
    if(!user) throw new httpError("Usuario no encontrado",404);
    return {telephone:user.telephone};
}