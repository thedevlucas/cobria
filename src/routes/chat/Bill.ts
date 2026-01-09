// Dependencies
import express from 'express';
// Services
import { getDebtorImages, deleteDebtorImage } from '../../services/chat/DebtorImageService';
// Helpers
import { verifyToken } from '../../helpers/Token';
// Custom error
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

router.get("/debtor/:id", verifyToken, async (req,res) => {
    try{
        const debtorImages = await getDebtorImages(Number(req.params.id));
        return res.status(200).json(debtorImages);
    }catch(error){
        errorHandler(error,res);
    }
})

router.delete("/image/:id", verifyToken, async (req,res) => {
    try{
        const response = await deleteDebtorImage(Number(req.params.id));
        return res.status(200).json(response);
    }catch(error){
        errorHandler(error,res);
    }
})

module.exports = router;