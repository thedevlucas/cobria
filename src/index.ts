// Dependencies
import express from "express";
import cors from "cors";
// Constants
import { port } from "./config/Constants";
// Database
import { database, mongoDB } from "./config/Database";
import { initializeDatabase } from "./config/initializeDatabase";
import "reflect-metadata";
import { initScheduledJobs } from "./jobs/scheduler";

const app = express();

// Middleware and json
app.use(express.json());
app.use(cors());

// Models
const { User } = require("./models/User");
const { Debtor } = require("./models/Debtor");
const { Stage } = require("./models/Stage");
const { Cellphone } = require("./models/Cellphone");
const { Chat } = require("./models/Chat");
const CallChat = require("./models/CallChat");
const { Telephone } = require("./models/Telephone");
// const { Agent } = require("./models/Agent");
// const { Cost } = require("./models/Cost");
// const { PendingMessage } = require("./models/PendingMessage");
// const { MessagesSchedule } = require("./models/MessagesSchedule");
// const { Client } = require("./models/Client");
// const { Company } = require("./models/Company");
// const { Ticket } = require("./models/Ticket");

require("./models/Associations");

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Debug route to check if server is responding
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "COBRIA Backend API is running",
    version: "1.0.0",
    endpoints: {
      register: "/api/register",
      login: "/api/login",
      health: "/health"
    }
  });
});

// Routes with error handling
async function loadRoutes() {
  try {
    app.use("/api/whatsapp", require("./routes/chat/WhatsApp"));
    console.log("✅ WhatsApp route loaded");
  } catch (error) {
    console.error("❌ Failed to load WhatsApp route:", error);
  }

  try {
    app.use("/api/register", require("./routes/user/Register"));
    console.log("✅ Register route loaded");
  } catch (error) {
    console.error("❌ Failed to load Register route:", error);
  }

  try {
    app.use("/api/password-recovery", require("./routes/user/PasswordRecovery"));
    console.log("✅ Password Recovery route loaded");
  } catch (error) {
    console.error("❌ Failed to load Password Recovery route:", error);
  }

  try {
    app.use("/api/login", require("./routes/user/Login"));
    console.log("✅ Login route loaded");
  } catch (error) {
    console.error("❌ Failed to load Login route:", error);
  }

  try {
    app.use("/api/admin", require("./routes/user/Admin"));
    console.log("✅ Admin route loaded");
  } catch (error) {
    console.error("❌ Failed to load Admin route:", error);
  }

  try {
    app.use("/api/user", require("./routes/user/User"));
    console.log("✅ User route loaded");
  } catch (error) {
    console.error("❌ Failed to load User route:", error);
  }

  try {
    app.use("/api/token", require("./routes/Token"));
    console.log("✅ Token route loaded");
  } catch (error) {
    console.error("❌ Failed to load Token route:", error);
  }

  try {
    app.use("/api/check-admin", require("./routes/user/CheckAdmin"));
    console.log("✅ Check Admin route loaded");
  } catch (error) {
    console.error("❌ Failed to load Check Admin route:", error);
  }

  try {
    app.use("/api/debtor", require("./routes/chat/Debtor"));
    console.log("✅ Debtor route loaded");
  } catch (error) {
    console.error("❌ Failed to load Debtor route:", error);
  }

  try {
    app.use("/api/cellphone", require("./routes/chat/Cellphone"));
    console.log("✅ Cellphone route loaded");
  } catch (error) {
    console.error("❌ Failed to load Cellphone route:", error);
  }

  try {
    app.use("/api/telephone", require("./routes/chat/Telephone"));
    console.log("✅ Telephone route loaded");
  } catch (error) {
    console.error("❌ Failed to load Telephone route:", error);
  }

  try {
    app.use("/api/call", require("./routes/chat/Call"));
    console.log("✅ Call route loaded");
  } catch (error) {
    console.error("❌ Failed to load Call route:", error);
  }

  try {
    app.use("/api/bill", require("./routes/chat/Bill"));
    console.log("✅ Bill route loaded");
  } catch (error) {
    console.error("❌ Failed to load Bill route:", error);
  }

  try {
    app.use("/api/company", require("./routes/user/Company"));
    console.log("✅ Company route loaded");
  } catch (error) {
    console.error("❌ Failed to load Company route:", error);
  }

  try {
    app.use("/api/analytics", require("./routes/analytics/Analytics"));
    console.log("✅ Analytics route loaded");
  } catch (error) {
    console.error("❌ Failed to load Analytics route:", error);
  }

  try {
    app.use("/api/collection-workflow", require("./routes/collection/CollectionWorkflow"));
    console.log("✅ Collection Workflow route loaded");
  } catch (error) {
    console.error("❌ Failed to load Collection Workflow route:", error);
  }

  try {
    app.use("/api/collection", require("./routes/collection/CollectionManagement"));
    console.log("✅ Collection Management route loaded");
  } catch (error) {
    console.error("❌ Failed to load Collection Management route:", error);
  }

  try {
    app.use("/api/costs", require("./routes/analytics/CostAnalytics"));
    console.log("✅ Cost Analytics route loaded");
  } catch (error) {
    console.error("❌ Failed to load Cost Analytics route:", error);
  }

  try {
    app.use("/api/ai", require("./routes/ai/AIFeedback"));
    console.log("✅ AI Feedback route loaded");
  } catch (error) {
    console.error("❌ Failed to load AI Feedback route:", error);
  }

  try {

    app.use("/api/ai/test", require("./routes/ai/TestAI").default);
    console.log("✅ TEST AI Feedback route loaded");
} catch (error) {
    console.error("❌ Failed to load TEST AI Feedback route:", error);
}

  try {
    app.use("/api/phone-numbers", require("./routes/agents/PhoneNumbers"));
    console.log("✅ Phone Numbers route loaded");
  } catch (error) {
    console.error("❌ Failed to load Phone Numbers route:", error);
  }

  try {
    app.use("/api/email", require("./routes/chat/Email"));
    console.log("✅ Email route loaded");
  } catch (error) {
    console.error("❌ Failed to load Email route:", error);
  }

  try {
    app.use("/api/sms", require("./routes/chat/SMS"));
    console.log("✅ SMS route loaded");
  } catch (error) {
    console.error("❌ Failed to load SMS route:", error);
  }

  try {
    app.use("/api/dashboard", require("./routes/dashboard/DashboardStats"));
    console.log("✅ Dashboard Stats route loaded");
  } catch (error) {
    console.error("❌ Failed to load Dashboard Stats route:", error);
  }

  try {
    // Apuntamos al archivo nuevo que creamos: EnhancedChatRoutes
    const enhancedChatRouter = await import("./routes/chat/EnhancedChat"); 
    app.use("/api/enhanced-chat", enhancedChatRouter.default);
    console.log("✅ Enhanced Chat route loaded (Corrected)");
  } catch (error) {
    console.error("❌ Failed to load Enhanced Chat route:", error);
  }

  try {
    const realChatRouter = await import("./routes/chat/WorkingRealChat");
    app.use("/api/real-chat", realChatRouter.default);
    console.log("✅ Real Chat route loaded");
  } catch (error) {
    console.error("❌ Failed to load Real Chat route:", error);
  }

  try {
    const collectionRouter = await import("./routes/collection/WorkingCollection");
    app.use("/api/collection", collectionRouter.default);
    console.log("✅ Collection Management route loaded");
  } catch (error) {
    console.error("❌ Failed to load Collection Management route:", error);
  }

  try {
    const billingRouter = await import("./routes/billing/WorkingBilling");
    app.use("/api/billing", billingRouter.default);
    console.log("✅ Billing route loaded");
  } catch (error) {
    console.error("❌ Failed to load Billing route:", error);
  }
}

// Server running
async function startServer() {
  try {
    console.log("🚀 Starting COBRIA Backend Server...");
    
    // Load all routes first
    await loadRoutes();
    
    // Connect to PostgreSQL
    await database.authenticate();
    console.log("✅ PostgreSQL database connected");
    
    // Initialize database schema (create tables if they don't exist)
    await initializeDatabase();
    console.log("✅ Database schema initialized");
    
    // MongoDB connection is handled separately and won't block server startup
    try {
      await mongoDB;
      console.log("✅ MongoDB database connected");
    } catch (error: any) {
      console.log("⚠️  MongoDB connection failed, but server will continue with PostgreSQL only:", error.message);
      console.log("Application will continue with PostgreSQL only");
    }
    
    // Start the server
    const server = app.listen(port, () => {
      initScheduledJobs();
      console.log("🎉 Server started successfully!");
      console.log(`📡 Server running on port: ${port}`);
      console.log(`🌐 Available endpoints:`);
      console.log(`   GET  http://localhost:${port}/`);
      console.log(`   GET  http://localhost:${port}/health`);
      console.log(`   POST http://localhost:${port}/api/register`);
      console.log(`   POST http://localhost:${port}/api/login`);
      console.log(`\n✅ All systems operational!`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please stop the other server or use a different port.`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error: any) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
