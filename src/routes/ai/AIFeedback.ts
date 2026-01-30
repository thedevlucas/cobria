import express from "express";
import { errorHandler } from "../../config/CustomError";
import { extractUserIdFromToken } from "../../helpers/Token";
import { Chat as ChatModel } from "../../models/Chat"; 

const router = express.Router();

router.post("/feedback", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "No token provided" });

    const userId = extractUserIdFromToken(token);
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    const { debtorCellphone, feedback } = req.body;

    if (!feedback || !debtorCellphone) {
      return res.status(400).json({ error: "Faltan datos (feedback y celular)" });
    }

    // Guardar feedback con el marcador [ADMIN_FEEDBACK] para que la IA lo reconozca
    await ChatModel.create({
      id_user: userId,
      from_cellphone: 0, 
      to_cellphone: Number(debtorCellphone),
      message: `[ADMIN_FEEDBACK]${feedback.trim()}[/ADMIN_FEEDBACK]`,
      status: false // No visible para el cliente
    });

    res.json({ success: true, message: "IA Entrenada para este deudor" });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

export = router;