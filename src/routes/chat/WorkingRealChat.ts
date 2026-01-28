// Working Real Chat Route - Con MongoDB COMPLETO
import express from 'express';

const router = express.Router();

// Simple middleware for testing
const simpleAuth = (req: any, res: any, next: any) => {
  // For now, just add a mock user ID
  req.body.idUser = req.body.idUser || 1;
  next();
};

// Get real conversations with debtors
router.get('/conversations', simpleAuth, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history for a specific debtor
router.get('/chats/:debtorId', simpleAuth, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to debtor
router.post('/send', simpleAuth, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI feedback and suggestions - REAL CON IA
router.get('/ai-feedback/:debtorId', simpleAuth, async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 GET /ai-feedback/:debtorId LLAMADO');
    
    const { debtorId } = req.params;
    const { idUser } = req.body;
    
    console.log('🔵 debtorId:', debtorId);
    console.log('🔵 idUser:', idUser);
    
    // Importar servicios necesarios
    const { RealChatService } = require('../../services/chat/RealChatService');
    
    console.log('🔵 Llamando a RealChatService.getAIFeedback...');
    
    // Usar el servicio REAL
    const feedback = await RealChatService.getAIFeedback(parseInt(debtorId), idUser);
    
    console.log('✅ Feedback de IA obtenido');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    res.json({
      success: true,
      data: feedback
    });
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR en GET /ai-feedback:', error);
    console.error('❌ Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Submit feedback to AI - REAL CON MONGODB
router.post('/ai-feedback', simpleAuth, async (req, res) => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🟢 POST /ai-feedback RECIBIDO');
    console.log('🟢 Body:', JSON.stringify(req.body, null, 2));
    
    const { debtorId, feedback, message } = req.body;
    const { idUser } = req.body;
    
    console.log('🟢 debtorId:', debtorId);
    console.log('🟢 feedback:', feedback);
    console.log('🟢 idUser:', idUser);
    
    // Importar modelos necesarios
    const { Debtor } = require('../../models/Debtor');
    const { Cellphone } = require('../../models/Cellphone');
    const { Chat } = require('../../models/Chat');
    
    console.log('🟢 Buscando deudor...');
    
    // Buscar el deudor con sus celulares
    const debtor = await Debtor.findOne({
      where: { id: debtorId },
      include: [{
        model: Cellphone,
        as: 'cellphones'
      }]
    });
    
    console.log('🟢 Debtor encontrado:', debtor ? 'SÍ' : 'NO');
    
    if (!debtor) {
      console.log('❌ Deudor no encontrado');
      return res.status(404).json({ error: 'Deudor no encontrado' });
    }
    
    console.log('🟢 Cellphones:', JSON.stringify(debtor.cellphones));
    
    if (!debtor.cellphones || debtor.cellphones.length === 0) {
      console.log('⚠️ Deudor no tiene celulares');
      return res.status(400).json({ error: 'Deudor no tiene números de teléfono' });
    }
    
    const phoneNumber = Number(debtor.cellphones[0].number);
    console.log('🟢 phoneNumber:', phoneNumber);
    
    console.log('🟢 Guardando en MongoDB Chat...');
    
    // Guardar en MongoDB
    const chatRecord = await Chat.create({
      id_user: idUser,
      from_cellphone: 0,
      to_cellphone: phoneNumber,
      message: `[ADMIN_FEEDBACK]${JSON.stringify({
        instruction: feedback,
        category: 'instruction',
        timestamp: new Date().toISOString()
      })}[/ADMIN_FEEDBACK]`,
      message_type: 'text',
      cost: 0,
      is_from_debtor: false,
      ai_feedback: feedback,
      collection_stage: 'feedback',
    });
    
    console.log('✅ Guardado en MongoDB con ID:', chatRecord._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    res.json({
      success: true,
      data: {
        success: true,
        message: 'Feedback guardado en MongoDB correctamente',
        mongoId: chatRecord._id
      }
    });
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ ERROR:', error);
    console.error('❌ Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get chat statistics
router.get('/statistics', simpleAuth, async (req, res) => {
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;