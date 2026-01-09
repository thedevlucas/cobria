import express from "express";
import { errorHandler } from "../../config/CustomError";
import { extractUserIdFromToken } from "../../helpers/Token";

const router = express.Router();

// In-memory storage for feedback (you can move this to MongoDB/PostgreSQL later)
interface FeedbackEntry {
  id: string;
  userId: number;
  messageId?: string;
  chatType: "whatsapp" | "call";
  originalMessage: string;
  feedback: string;
  rating?: number;
  category: "positive" | "negative" | "suggestion";
  createdAt: string;
}

const feedbackStore: FeedbackEntry[] = [];

// Submit feedback for AI
router.post("/feedback", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { messageId, chatType, originalMessage, feedback, rating, category } = req.body;

    if (!feedback || !chatType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const feedbackEntry: FeedbackEntry = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      messageId,
      chatType,
      originalMessage: originalMessage || "",
      feedback,
      rating: rating || 0,
      category: category || "suggestion",
      createdAt: new Date().toISOString(),
    };

    feedbackStore.push(feedbackEntry);

    // TODO: Process feedback to improve AI model
    // This could trigger retraining or fine-tuning

    res.json({
      success: true,
      message: "Feedback received successfully",
      feedbackId: feedbackEntry.id,
    });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get feedback history
router.get("/feedback", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userFeedback = feedbackStore.filter(f => f.userId === userId);
    
    res.json({
      total: userFeedback.length,
      feedback: userFeedback.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get AI insights for a specific message
router.get("/insights/:messageId", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { messageId } = req.params;

    // Get feedback for this message
    const messageFeedback = feedbackStore.filter(
      f => f.messageId === messageId && f.userId === userId
    );

    // Generate insights
    const insights = {
      messageId,
      feedbackCount: messageFeedback.length,
      averageRating: messageFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (messageFeedback.length || 1),
      sentiment: analyzeSentiment(messageFeedback),
      suggestions: messageFeedback.filter(f => f.category === "suggestion").map(f => f.feedback),
      improvements: generateImprovements(messageFeedback),
    };

    res.json(insights);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get AI performance metrics
router.get("/performance", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userFeedback = feedbackStore.filter(f => f.userId === userId);

    const metrics = {
      totalFeedback: userFeedback.length,
      averageRating: userFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (userFeedback.length || 1),
      positiveCount: userFeedback.filter(f => f.category === "positive").length,
      negativeCount: userFeedback.filter(f => f.category === "negative").length,
      suggestionCount: userFeedback.filter(f => f.category === "suggestion").length,
      byChannel: {
        whatsapp: userFeedback.filter(f => f.chatType === "whatsapp").length,
        call: userFeedback.filter(f => f.chatType === "call").length,
      },
      recentFeedback: userFeedback.slice(0, 10),
    };

    res.json(metrics);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Helper functions
function analyzeSentiment(feedback: FeedbackEntry[]): string {
  const positive = feedback.filter(f => f.category === "positive").length;
  const negative = feedback.filter(f => f.category === "negative").length;
  
  if (positive > negative * 2) return "very_positive";
  if (positive > negative) return "positive";
  if (negative > positive * 2) return "very_negative";
  if (negative > positive) return "negative";
  return "neutral";
}

function generateImprovements(feedback: FeedbackEntry[]): string[] {
  const improvements: string[] = [];
  
  const negativeFeedback = feedback.filter(f => f.category === "negative");
  const suggestionFeedback = feedback.filter(f => f.category === "suggestion");
  
  if (negativeFeedback.length > 0) {
    improvements.push("Review negative feedback to identify common issues");
  }
  
  if (suggestionFeedback.length > 0) {
    improvements.push("Implement user suggestions for better responses");
  }
  
  const avgRating = feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / (feedback.length || 1);
  if (avgRating < 3) {
    improvements.push("Consider adjusting conversation tone and approach");
  }
  
  return improvements;
}

export = router;
