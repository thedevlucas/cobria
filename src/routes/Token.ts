// Dependencies
import express from 'express';
// Helpers
import { verifyToken, createToken } from '../helpers/Token';
// Custom error
import { errorHandler } from '../config/CustomError';

const router = express.Router();

router.get("/", verifyToken, async (req,res)=>{
    try{
        const token = createToken(Number(req.params.idToken));
        return res.status(200).json({token});
    }catch(error:any){
        errorHandler(error,res);
    }
})

// Export verifyToken for use in other files
export { verifyToken };

module.exports = router;