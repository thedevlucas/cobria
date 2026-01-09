import express from 'express';
import { RealChatService } from '../../services/chat/RealChatService';

const router = express.Router();

router.post('/feedback', async (req, res) => {
  try {
    const { debtorId, feedback, userId } = req.body;
    const result = await RealChatService.submitAIFeedback({
      debtorId, 
      userId,
      feedback,
      message: "Test message"
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { debtorId, userId } = req.body;
    const response = await RealChatService.getAIFeedback(debtorId, userId);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;