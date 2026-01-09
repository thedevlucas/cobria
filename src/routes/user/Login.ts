// Dependencies
import express from 'express';
// Schemas
import { loginValidator } from "../../schemas/UserSchema";
// Custom error
import { errorHandler } from '../../config/CustomError';
// Services
import { login } from '../../services/user/LoginService';

const router = express.Router();

router.post("/", loginValidator, async (req,res)=>{
    try{
        const token = await login(req.body.email,req.body.password);
        res.status(200).json({token});
    }catch(error:any){
        errorHandler(error,res);
    }
})

module.exports = router;