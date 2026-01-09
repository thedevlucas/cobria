import express from "express";
import { errorHandler } from "../../config/CustomError";
import { GetCollectionWorkflow } from "../../Contexts/BillingPlatform/collection/application/use-cases/GetCollectionWorkflow";
import { UpdateDebtorStage } from "../../Contexts/BillingPlatform/collection/application/use-cases/UpdateDebtorStage";
import { ScheduleNextAction } from "../../Contexts/BillingPlatform/collection/application/use-cases/ScheduleNextAction";
import { debtorRepository } from "../../Contexts/Shared/infrastructure/dependencies";

const router = express.Router();

// Get collection workflow data
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const getCollectionWorkflow = new GetCollectionWorkflow(debtorRepository);
    const workflowData = await getCollectionWorkflow.run({ userId });
    res.json(workflowData);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Update debtor stage
router.put("/debtor/:debtorId/stage", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { debtorId } = req.params;
    const { stage, notes } = req.body;

    const updateDebtorStage = new UpdateDebtorStage(debtorRepository);
    await updateDebtorStage.run({
      debtorId: parseInt(debtorId),
      newStage: stage,
      notes,
      userId,
    });

    res.json({ success: true });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Schedule next action
router.post("/debtor/:debtorId/schedule", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { debtorId } = req.params;
    const { action, scheduledDate } = req.body;

    const scheduleNextAction = new ScheduleNextAction(debtorRepository);
    await scheduleNextAction.run({
      debtorId: parseInt(debtorId),
      action,
      scheduledDate: new Date(scheduledDate),
      userId,
    });

    res.json({ success: true });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Helper function to extract user ID from JWT token
function extractUserIdFromToken(token: string): number | null {
  try {
    const jwt = require("jsonwebtoken");
    const { jwt_key } = require("../../config/Constants");
    const decoded = jwt.verify(token, jwt_key);
    return decoded.id;
  } catch (error) {
    return null;
  }
}

module.exports = router;
