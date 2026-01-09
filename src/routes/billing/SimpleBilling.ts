// Simplified Billing Route - Working Version
import express from 'express';
import { verifyToken } from '../Token';
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

// Get cost records
router.get('/costs', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const { period = '30' } = req.query;
    
    // Mock cost data
    const costs = [
      {
        id: 1,
        cost_type: 'message',
        amount: 0.05,
        description: 'WhatsApp message sent to John Doe',
        phone_number: 1234567890,
        created_at: new Date().toISOString(),
        status: 'processed',
        currency: 'USD'
      },
      {
        id: 2,
        cost_type: 'call',
        amount: 0.15,
        description: 'Phone call to Jane Smith',
        phone_number: 9876543210,
        created_at: new Date().toISOString(),
        status: 'processed',
        currency: 'USD'
      }
    ];
    
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
    
    // Mock billing summary
    const summary = {
      total_cost: 125.50,
      monthly_cost: 89.75,
      daily_cost: 4.25,
      cost_by_type: {
        messages: 45.30,
        calls: 32.20,
        sms: 15.80,
        emails: 8.40,
        subscription: 99.99,
        bot_rental: 25.00
      },
      usage_stats: {
        total_messages: 150,
        total_calls: 25,
        total_sms: 80,
        total_emails: 40
      },
      billing_period: {
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        days_remaining: 15
      }
    };
    
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
    
    // Mock subscription info
    const subscription = {
      plan_name: 'Professional Plan',
      monthly_fee: 99.99,
      included_credits: 1000,
      used_credits: 750,
      remaining_credits: 250,
      next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      auto_renewal: true
    };
    
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
    
    // Mock payment processing
    const result = {
      success: true,
      transaction_id: `txn_${Date.now()}`,
      amount: amount,
      currency: 'USD',
      status: 'completed',
      message: 'Payment processed successfully'
    };
    
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
    
    // Mock invoice data
    const invoice = {
      invoice_id: `INV-${costId}`,
      date: new Date().toISOString(),
      amount: 25.50,
      description: 'Service charges for debt collection',
      user_id: idUser
    };
    
    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;

