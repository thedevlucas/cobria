// Real Chat Implementation - Senior Full Stack Developer
import express from 'express';
import { verifyToken } from '../Token';
import { errorHandler } from '../../config/CustomError';
import { RealChatService } from '../../services/chat/RealChatService';

const router = express.Router();

// Get real conversations with debtors
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const conversations = await RealChatService.getConversations(idUser);
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
    const messages = await RealChatService.getChatHistory(parseInt(debtorId), idUser);
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
    
    const result = await RealChatService.sendMessage({
      debtorId: parseInt(debtorId),
      message,
      messageType,
      userId: idUser
    });
    
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
    
    const feedback = await RealChatService.getAIFeedback(parseInt(debtorId), idUser);
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
    
    const result = await RealChatService.submitAIFeedback({
      debtorId: parseInt(debtorId),
      feedback,
      message,
      userId: idUser
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

// Get chat statistics
router.get('/statistics', verifyToken, async (req, res) => {
  try {
    const { idUser } = req.body;
    const stats = await RealChatService.getChatStatistics(idUser);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;

