// Billing API - Senior Full Stack Developer Implementation
import express from 'express';
import { verifyToken } from '../Token';
import { errorHandler } from '../../config/CustomError';
import { BillingService } from '../../services/billing/BillingService';

const router = express.Router();

// Get cost records
router.get('/costs', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const { period = '30' } = req.query;
    const costs = await BillingService.getCostRecords(idUser, parseInt(period as string));
    res.json({
      success: true,
      data: costs
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get billing summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const summary = await BillingService.getBillingSummary(idUser);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get subscription info
router.get('/subscription', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const subscription = await BillingService.getSubscriptionInfo(idUser);
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Process payment
router.post('/payment', verifyToken, async (req, res) => {
  try {
    const { amount, payment_method } = req.body;
    const { idUser } = req.body;
    
    const result = await BillingService.processPayment({
      userId: idUser,
      amount,
      paymentMethod: payment_method
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get invoice
router.get('/invoice/:costId', verifyToken, async (req, res) => {
  try {
    const { costId } = req.params;
    const { idUser } = req.body;
    
    const invoice = await BillingService.generateInvoice(parseInt(costId), idUser);
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Update subscription
router.put('/subscription', verifyToken, async (req, res) => {
  try {
    const { plan_name, auto_renewal } = req.body;
    const { idUser } = req.body;
    
    const result = await BillingService.updateSubscription(idUser, {
      plan_name,
      auto_renewal
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get payment history
router.get('/payments', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const payments = await BillingService.getPaymentHistory(idUser);
    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get usage analytics
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const analytics = await BillingService.getUsageAnalytics(idUser);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;

