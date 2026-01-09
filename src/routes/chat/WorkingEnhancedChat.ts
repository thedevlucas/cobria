// Working Enhanced Chat Route - No Dependencies
import express from 'express';

const router = express.Router();

// Simple middleware for testing
const simpleAuth = (req: any, res: any, next: any) => {
  // For now, just add a mock user ID
  req.params = { idToken: '1' };
  req.body = { idUser: 1 };
  next();
};

// Simple test endpoint
router.get("/test", (req, res) => {
  res.json({ message: "Enhanced Chat API is working!" });
});

// Get all chats for a user with pagination
router.get("/chats/:idToken", simpleAuth, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`📱 Getting chats for user ${userId}, limit: ${limit}, offset: ${offset}`);

    // Mock chat data
    const chats = [
      {
        id: 1,
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
      },
      {
        id: 2,
        debtor_name: "Jane Smith",
        debtor_document: "87654321",
        phone_number: 9876543210,
        latest_message: "I can make a partial payment",
        latest_timestamp: new Date(),
        message_count: 3,
        unread_count: 1,
        collection_stage: "reminder",
        payment_probability: 0.60,
        last_interaction: new Date()
      }
    ];

    res.json({
      success: true,
      data: chats,
      pagination: {
        total: chats.length,
        limit,
        offset,
        hasMore: false
      }
    });
  } catch (error) {
    console.error("❌ Error getting chats:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent conversations
router.get("/conversations/:idToken", simpleAuth, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const limit = parseInt(req.query.limit as string) || 10;

    console.log(`📱 Getting recent conversations for user ${userId}, limit: ${limit}`);

    // Mock conversation data
    const conversations = [
      {
        id: 1,
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
    console.error("❌ Error getting conversations:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat statistics
router.get("/statistics/:idToken", simpleAuth, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);

    console.log(`📊 Getting chat statistics for user ${userId}`);

    // Mock statistics
    const statistics = {
      totalChats: 25,
      activeChats: 8,
      totalMessages: 150,
      unreadMessages: 12,
      averageResponseTime: 2.5,
      successRate: 85.5,
      totalCost: 45.30,
      monthlyCost: 89.75,
      dailyCost: 4.25
    };

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error("❌ Error getting statistics:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history for a specific debtor
router.get("/chats/:idToken/:debtorId", simpleAuth, async (req, res) => {
  try {
    const { debtorId } = req.params;
    const userId = Number(req.params.idToken);

    console.log(`📱 Getting chat history for debtor ${debtorId}, user ${userId}`);

    // Mock chat history
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
      },
      {
        id: "2",
        message: "Thank you for contacting us. We can help you with a payment plan.",
        from_cellphone: 9876543210,
        to_cellphone: 1234567890,
        from_debtor_name: "Agent",
        to_debtor_name: "John Doe",
        message_type: "text",
        status: "sent",
        timestamp: new Date(),
        cost: 0.01,
        is_from_debtor: false,
        ai_feedback: "Message sent successfully",
        collection_stage: "initial"
      }
    ];

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("❌ Error getting chat history:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to debtor
router.post("/chats/:idToken/:debtorId/send", simpleAuth, async (req, res) => {
  try {
    const { debtorId } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = Number(req.params.idToken);

    console.log(`📤 Sending message to debtor ${debtorId} from user ${userId}`);

    // Mock response
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
    console.error("❌ Error sending message:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI feedback for a debtor
router.get("/ai-feedback/:idToken/:debtorId", simpleAuth, async (req, res) => {
  try {
    const { debtorId } = req.params;
    const userId = Number(req.params.idToken);

    console.log(`🤖 Getting AI feedback for debtor ${debtorId}, user ${userId}`);

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
    console.error("❌ Error getting AI feedback:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit feedback to AI
router.post("/ai-feedback/:idToken", simpleAuth, async (req, res) => {
  try {
    const { debtorId, feedback, message } = req.body;
    const userId = Number(req.params.idToken);

    console.log(`📝 Submitting AI feedback for debtor ${debtorId}, user ${userId}`);

    res.json({
      success: true,
      data: {
        success: true,
        message: 'Feedback submitted successfully'
      }
    });
  } catch (error) {
    console.error("❌ Error submitting AI feedback:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

