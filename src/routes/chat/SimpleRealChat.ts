// Simplified Real Chat Route - Working Version
import express from 'express';
import { verifyToken } from '../Token';
import { errorHandler } from '../../config/CustomError';

const router = express.Router();

// Get real conversations with debtors
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock data for now
    const conversations = [
      {
        debtor_id: 1,
        debtor_name: "John Doe",
        debtor_document: "12345678",
        phone_number: 1234567890,
        latest_message: "Hello, I need to discuss my payment",
        latest_timestamp: new Date(),
        message_count: 5,
        unread_count: 2,
        collection_stage: "initial",
        payment_probability: 0.75,
        last_interaction: new Date()
      }
    ];
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get chat history for a specific debtor
router.get('/chats/:debtorId', verifyToken, async (req, res) => {
  try {
    const { debtorId } = req.params;
    const { idUser } = req.body;
    
    // Mock data for now
    const messages = [
      {
        id: "1",
        message: "Hello, I need to discuss my payment",
        from_cellphone: 1234567890,
        to_cellphone: 9876543210,
        from_debtor_name: "John Doe",
        to_debtor_name: "Agent",
        message_type: "text",
        status: "delivered",
        timestamp: new Date(),
        cost: 0.01,
        is_from_debtor: true,
        ai_feedback: "Debtor is responsive and willing to discuss payment",
        collection_stage: "initial"
      }
    ];
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Send message to debtor
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { debtorId, message, messageType = 'text' } = req.body;
    const { idUser } = req.body;
    
    // Mock response for now
    const result = {
      id: Date.now().toString(),
      message: message,
      from_cellphone: 9876543210,
      to_cellphone: 1234567890,
      from_debtor_name: 'Agent',
      to_debtor_name: 'John Doe',
      message_type: messageType,
      status: 'sent',
      timestamp: new Date(),
      cost: 0.01,
      is_from_debtor: false,
      ai_feedback: 'Message sent successfully',
      collection_stage: 'initial'
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get AI feedback and suggestions
router.get('/ai-feedback/:debtorId', verifyToken, async (req, res) => {
  try {
    const { debtorId } = req.params;
    const { idUser } = req.body;
    
    // Mock AI feedback
    const feedback = {
      suggested_message: "Hola, le contactamos para coordinar el pago de su deuda. ¿Podríamos programar una llamada?",
      collection_strategy: "Enfoque empático con opciones de pago claras",
      urgency_level: "medium",
      next_action: "Enviar recordatorio amigable",
      payment_probability: 0.75,
      personalized_approach: "Usar tono empático y ofrecer opciones de pago flexibles",
      risk_assessment: "Bajo riesgo - deudor tiene historial de pago positivo"
    };
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Submit feedback to AI
router.post('/ai-feedback', verifyToken, async (req, res) => {
  try {
    const { debtorId, feedback, message } = req.body;
    const { idUser } = req.body;
    
    res.json({
      success: true,
      data: {
        success: true,
        message: 'Feedback submitted successfully'
      }
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get chat statistics
router.get('/statistics', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    
    // Mock statistics
    const stats = {
      totalMessages: 25,
      totalCost: 12.50,
      successRate: 85.5,
      averageResponseTime: 2.5,
      activeConversations: 8,
      pendingMessages: 3,
      collectionStages: {
        initial: 5,
        reminder: 2,
        urgent: 1,
        final: 0,
        completed: 2
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;

