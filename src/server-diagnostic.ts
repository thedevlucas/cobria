#!/usr/bin/env node

/**
 * Server Diagnostic Tool
 * Comprehensive server startup and route verification
 */

import express from "express";
import cors from "cors";
import { port } from "./config/Constants";

console.log("🔍 COBRIA Backend Diagnostic Tool");
console.log("================================\n");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic routes for testing
app.get("/", (req, res) => {
  res.json({
    message: "COBRIA Backend Diagnostic Server",
    status: "running",
    timestamp: new Date().toISOString(),
    port: port
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    uptime: process.uptime()
  });
});

// Test register route
app.post("/api/register", (req, res) => {
  res.json({
    message: "Register endpoint is working",
    received: req.body,
    timestamp: new Date().toISOString()
  });
});

// Route loading test
console.log("📋 Testing route loading...");

const routesToTest = [
  "./routes/user/Register",
  "./routes/user/Login", 
  "./routes/chat/WhatsApp",
  "./routes/user/Admin"
];

routesToTest.forEach(routePath => {
  try {
    const route = require(routePath);
    console.log(`✅ ${routePath}: Loaded successfully`);
  } catch (error) {
    console.log(`❌ ${routePath}: Failed to load - ${(error as any).message}`);
  }
});

// Start diagnostic server
app.listen(port, () => {
  console.log(`\n🚀 Diagnostic server running on port ${port}`);
  console.log(`📡 Test endpoints:`);
  console.log(`   GET  http://localhost:${port}/`);
  console.log(`   GET  http://localhost:${port}/health`);
  console.log(`   POST http://localhost:${port}/api/register`);
  console.log(`\n💡 Use these to test if the server is responding correctly`);
});
