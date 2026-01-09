// Dependencies
import * as crypto from 'crypto';
// Environment variables
import { crypt_algorithm, crypt_key, crypt_iv } from './Constants';

// Cipher
const algorithm = crypt_algorithm || 'defaultAlgorithm';
const key = crypt_key || 'defaultKey';
const iv = crypt_iv || 'defaultIV';

const keyBuffer = Buffer.from(key,'hex'); 
const ivBuffer = Buffer.from(iv,'hex');

// Encrypt data
export function encrypt(text:string){
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, ivBuffer);
    let newText = cipher.update(text, 'utf8', 'hex');
    newText += cipher.final('hex');
    return newText;
}

// Decipher
export function decrypt(text:string){
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
    let newText = decipher.update(text, 'hex', 'utf8');
    newText += decipher.final('utf8');
    return newText;
}