// Dependencies
import express from 'express';
// Services
import { getDebtorImages, deleteDebtorImage } from '../../services/chat/DebtorImageService';
// Custom error
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

router.get("/debtor/:id", async (req,res) => {
    try{
        const debtorImages = await getDebtorImages(Number(req.params.id));
        return res.status(200).json(debtorImages);
    }catch(error){
        errorHandler(error,res);
    }
})

router.delete("/image/:id", async (req,res) => {
    try{
        const response = await deleteDebtorImage(Number(req.params.id));
        return res.status(200).json(response);
    }catch(error){
        errorHandler(error,res);
    }
})

module.exports = router;