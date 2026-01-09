import express from 'express';
import { verifyToken } from '../../helpers/Token'; 
import { BillingService } from '../../services/billing/BillingService'; 
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

const getUserId = (req: any): number => {
    const id = req.params.idToken || req.body.idToken || req.userId;
    return Number(id);
};

router.get('/costs', verifyToken, async (req: any, res) => {
  try {
    const idUser = getUserId(req);
    
    if (!idUser || isNaN(idUser)) {
        return res.status(401).json({ success: false, message: 'Usuario no identificado' });
    }

    const { period = '30' } = req.query;
    const costs = await BillingService.getCostRecords(idUser, parseInt(period as string));
    
    res.json({ success: true, data: costs });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/summary', verifyToken, async (req: any, res) => {
  try {
    const idUser = getUserId(req);
    if (!idUser || isNaN(idUser)) return res.status(401).json({ message: 'Usuario invalido' });

    const summary = await BillingService.getBillingSummary(idUser);
    res.json({ success: true, data: summary });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/subscription', verifyToken, async (req: any, res) => {
  try {
    const idUser = getUserId(req);
    if (!idUser || isNaN(idUser)) return res.status(401).json({ message: 'Usuario invalido' });

    const subscription = await BillingService.getSubscriptionInfo(idUser);
    res.json({ success: true, data: subscription });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.post('/payment', verifyToken, async (req: any, res) => {
  try {
    const { amount, payment_method } = req.body;
    const idUser = getUserId(req);
    
    if (!idUser || isNaN(idUser)) return res.status(401).json({ message: 'Usuario invalido' });

    const result = await BillingService.processPayment({
      userId: idUser,
      amount,
      paymentMethod: payment_method
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    errorHandler(error, res);
  }
});

router.get('/invoice/:costId', verifyToken, async (req: any, res) => {
  try {
    const { costId } = req.params;
    const idUser = getUserId(req);
    
    if (!idUser || isNaN(idUser)) return res.status(401).json({ message: 'Usuario invalido' });

    const invoice = await BillingService.generateInvoice(parseInt(costId), idUser);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${costId}.pdf`);
    res.send(invoice);
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;