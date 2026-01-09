#!/usr/bin/env node

/**
 * Frontend Development Setup Script
 * Ensures proper configuration for development
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up COBRIA Frontend for Development...\n');

// Create .env.local file if it doesn't exist
const envPath = path.join(__dirname, '.env.local');
const envContent = `# Frontend Environment Variables
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=COBRIA
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

// Check if backend is running
const http = require('http');

function checkBackend() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log('✅ Backend server is running on port 3001');
      resolve(true);
    });

    req.on('error', () => {
      console.log('⚠️  Backend server is not running on port 3001');
      console.log('💡 Start the backend with: cd ../cobria-backend && npm run dev');
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⚠️  Backend server check timed out');
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking backend connection...');
  const backendRunning = await checkBackend();
  
  console.log('\n📋 Development Setup Summary:');
  console.log('==============================');
  console.log('✅ Frontend environment configured');
  console.log('✅ API_URL set to: http://localhost:3001');
  
  if (backendRunning) {
    console.log('✅ Backend server is running');
    console.log('\n🎉 Ready to start development!');
    console.log('💡 Run: npm run dev');
  } else {
    console.log('⚠️  Backend server needs to be started');
    console.log('\n📋 Next steps:');
    console.log('1. Start backend: cd ../cobria-backend && npm run dev');
    console.log('2. Start frontend: npm run dev');
  }
}

main().catch(console.error);
