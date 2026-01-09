import express from "express";
import { errorHandler } from "../../config/CustomError";
import { GetUsageAnalytics } from "../../Contexts/BillingPlatform/analytics/application/use-cases/GetUsageAnalytics";
import { GetCollectionReport } from "../../Contexts/BillingPlatform/analytics/application/use-cases/GetCollectionReport";
import { costRepository, debtorRepository, chatRepository, callChatRepository } from "../../Contexts/Shared/infrastructure/dependencies";

const router = express.Router();

// Get usage analytics for the current user
router.get("/usage", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract user ID from token (you'll need to implement this)
    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const getUsageAnalytics = new GetUsageAnalytics(
      costRepository,
      debtorRepository,
      chatRepository,
      callChatRepository
    );

    const analytics = await getUsageAnalytics.run({ userId });
    res.json(analytics);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get collection report
router.get("/collection-report", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { start, end } = req.query;
    const dateRange = start && end ? { start: start as string, end: end as string } : undefined;

    const getCollectionReport = new GetCollectionReport(
      debtorRepository,
      chatRepository,
      callChatRepository
    );

    const report = await getCollectionReport.run({ userId, dateRange });
    res.json(report);
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
