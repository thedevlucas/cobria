// Enhanced Chat Routes - Senior Developer Implementation
import express from "express";
import { errorHandler } from "../../config/CustomError";
import { verifyToken } from "../../helpers/Token";
import { RealChatService } from "../../services/chat/RealChatService"; 

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Enhanced Chat API (Real) is working!" });
});

router.get("/chats", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const chats = await RealChatService.getConversations(userId);
    
    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error("❌ Error getting chats:", error);
    errorHandler(error, res);
  }
});

router.get("/chats/:debtorId", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const debtorId = parseInt(req.params.debtorId);

    const chatHistory = await RealChatService.getChatHistory(debtorId, userId);
    
    res.json({
      success: true,
      data: chatHistory
    });
  } catch (error) {
    console.error("❌ Error getting chat history:", error);
    errorHandler(error, res);
  }
});

router.post("/chats/:debtorId/send", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const debtorId = parseInt(req.params.debtorId);
    
    const { message, type = 'text' } = req.body; 

    console.log(`📤 Intento de envío: User ${userId} -> Deudor ID ${debtorId}`);

    if (!debtorId || debtorId === 0) {
        return res.status(400).json({
            success: false,
            message: "Error: ID de chat inválido (0). Por favor selecciona un chat de la lista antes de enviar."
        });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "El mensaje no puede estar vacío"
      });
    }

    const result = await RealChatService.sendMessage({
        debtorId,
        userId,
        message,
        messageType: type
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    errorHandler(error, res);
  }
});

router.get("/statistics", verifyToken, async (req, res) => {
  try {
    const userId = Number(req.params.idToken);
    const statistics = await RealChatService.getChatStatistics(userId);
    res.json({ success: true, data: statistics });
  } catch (error) {
    errorHandler(error, res);
  }
});

export default router;