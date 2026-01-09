// Dependencies
const jwt = require('jsonwebtoken');
import {Request, Response, NextFunction} from 'express';
// Env
import { jwt_key, jwt_expires_in } from '../config/Constants';
// Models
import { User } from '../models/User';

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const header = req.header('Authorization') || '';
    const token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No existe token'});
    }
    try {
        const payload = jwt.verify(token, jwt_key);
        req.params.idToken = payload.id;
        const user = await User.findOne({ where: { id: payload.id } });
        if (!user) {
            return res.status(404).json({ message: 'No es valido el token' });
        }
        if(!user.active){
            return res.status(403).json({ message: 'Usuario inactivo' });
        }

        next();
    } catch (error) {
        return res.status(403).json({ message: 'No es valido el token' });
    }
}

export function createToken(id:Number){
    return jwt.sign({ id: id }, jwt_key, { expiresIn: jwt_expires_in });
}

export function extractUserIdFromToken(token: string): number | null {
    try {
        const payload = jwt.verify(token, jwt_key);
        return payload.id || null;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
}