// Dependencies
const bcrypt = require('bcrypt');
import {Request, Response, NextFunction} from "express";
// Models
import { User } from "../../models/User";
// Env variables
import { password_salt } from "../../config/Constants";

// Hash password
export function hashPassword(password:string){
    return bcrypt.hashSync(password, password_salt);
}
export function comparePassword(password:string, hash:string){
    return bcrypt.compareSync(password, hash);
}

// Check if the user is an admin
export async function checkAdmin(req: Request,res: Response,next:NextFunction){
    const user = await User.findOne({where: {id: req.params.idToken}});
    if(user && user.role != "user") {
        next();
    }
    else{
        return res.status(403).json({ message: "El usuario no es administrador" });
    }
}

