// Dependencies
import express from 'express';
// Schemas
import { emailValidator, passwordValidator } from '../../schemas/UserSchema';
// Services
import { sendRecoveryEmail, sendRecoveryLink, recoverPassword } from '../../services/user/PassRecovService';
// Custom error
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

// Send link to recover password
router.post("/", emailValidator, async (req,res)=>{
    try{
        const link = await sendRecoveryLink(req.body.email);
        await sendRecoveryEmail(req.body.email,link);
        res.status(200).json({"message":"Correo enviado"});
    }catch(error:any){
        errorHandler(error,res);
    }
})

// Recover password
router.post("/:token",passwordValidator, async (req,res)=>{
    try{
        const result = await recoverPassword(req.params.token,req.body.password);
        res.status(200).json(result);
    }catch(error:any){
        errorHandler(error,res);
    }
})

module.exports = router;