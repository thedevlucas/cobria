import express from "express";
import { errorHandler } from "../../config/CustomError";
import { extractUserIdFromToken } from "../../helpers/Token";
import { costRepository } from "../../Contexts/Shared/infrastructure/dependencies";

const router = express.Router();

// Get user's cost summary
router.get("/costs/summary", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get costs grouped by type
    const costs = await costRepository.findCostsByCompany(userId);
    
    // Calculate totals
    const summary = {
      total: 0,
      byType: {
        whatsapp: 0,
        sms: 0,
        call: 0,
        email: 0,
        agent: 0,
      },
      thisMonth: 0,
      lastMonth: 0,
      transactions: costs.length,
      averagePerTransaction: 0,
    };

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    costs.forEach((cost: any) => {
      const amount = Number(cost.amount);
      summary.total += amount;
      
      // By type
      if (cost.type in summary.byType) {
        summary.byType[cost.type as keyof typeof summary.byType] += amount;
      }

      // By month
      const costDate = new Date(cost.createdAt);
      if (costDate >= firstDayThisMonth) {
        summary.thisMonth += amount;
      } else if (costDate >= firstDayLastMonth && costDate <= lastDayLastMonth) {
        summary.lastMonth += amount;
      }
    });

    summary.averagePerTransaction = costs.length > 0 ? summary.total / costs.length : 0;

    // Round all values to 2 decimals
    summary.total = Number(summary.total.toFixed(2));
    summary.thisMonth = Number(summary.thisMonth.toFixed(2));
    summary.lastMonth = Number(summary.lastMonth.toFixed(2));
    summary.averagePerTransaction = Number(summary.averagePerTransaction.toFixed(2));
    Object.keys(summary.byType).forEach(key => {
      summary.byType[key as keyof typeof summary.byType] = Number(
        summary.byType[key as keyof typeof summary.byType].toFixed(2)
      );
    });

    res.json(summary);
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get detailed cost history
router.get("/costs/history", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { startDate, endDate, type, limit = 100 } = req.query;

    let costs = await costRepository.findCostsByCompany(userId);

    // Filter by type
    if (type && type !== "all") {
      costs = costs.filter((c: any) => c.type === type);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate as string);
      costs = costs.filter((c: any) => new Date(c.createdAt) >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      costs = costs.filter((c: any) => new Date(c.createdAt) <= end);
    }

    // Sort by date descending
    costs.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Limit results
    costs = costs.slice(0, Number(limit));

    res.json({
      total: costs.length,
      costs: costs.map((c: any) => ({
        id: c.id,
        amount: Number(c.amount).toFixed(2),
        type: c.type,
        createdAt: c.createdAt,
        description: getTypeDescription(c.type),
      })),
    });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Get cost trends (daily/weekly/monthly)
router.get("/costs/trends", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { period = "monthly", months = 6 } = req.query;

    const costs = await costRepository.findCostsByCompany(userId);
    
    const trends: Record<string, number> = {};
    const now = new Date();

    costs.forEach((cost: any) => {
      const date = new Date(cost.createdAt);
      let key: string;

      if (period === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (period === "weekly") {
        const weekNumber = getWeekNumber(date);
        key = `${date.getFullYear()}-W${weekNumber}`;
      } else {
        // monthly
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!trends[key]) {
        trends[key] = 0;
      }
      trends[key] += Number(cost.amount);
    });

    // Convert to array and sort
    const trendsArray = Object.entries(trends)
      .map(([date, amount]) => ({
        date,
        amount: Number(amount.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      period,
      data: trendsArray,
    });
  } catch (error: any) {
    errorHandler(error, res);
  }
});

// Helper functions
function getTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    whatsapp: "Mensaje WhatsApp",
    sms: "Mensaje SMS",
    call: "Llamada telefónica",
    email: "Email enviado",
    agent: "Agente alquilado",
  };
  return descriptions[type] || type;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export = router;

