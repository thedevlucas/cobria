#!/usr/bin/env node

/**
 * Railway Production Setup Automation
 * This script automates the configuration of Railway environment variables
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🚀 Railway Production Setup Automation');
console.log('=====================================\n');

// Generate secure encryption keys
function generateSecureKeys() {
  console.log('🔐 Generating secure encryption keys...');
  
  const cryptKey = crypto.randomBytes(32).toString('hex');
  const cryptIV = crypto.randomBytes(16).toString('hex');
  const jwtKey = crypto.randomBytes(64).toString('base64');
  
  console.log('✅ Secure keys generated successfully\n');
  
  return {
    CRYPT_KEY: cryptKey,
    CRYPT_IV: cryptIV,
    JWT_KEY: jwtKey
  };
}

// Create Railway configuration
function createRailwayConfig() {
  const keys = generateSecureKeys();
  
  const railwayConfig = {
    // Environment
    NODE_ENV: 'production',
    
    // Database (PostgreSQL)
    DATABASE_HOST: 'postgres',
    DATABASE_NAME: 'cobraria_db',
    DATABASE_USER: 'postgres',
    DATABASE_PASSWORD: 'password',
    DATABASE_PORT: '5432',
    ENDPOINT_DATABASE: 'postgres',
    DATABASE_URL: 'postgresql://postgres:password@postgres:5432/cobraria_db',
    
    // MongoDB (Optional - can be disabled)
    MONGO_URL: 'mongodb://mongo:27017/cobraria',
    
    // Encryption (CRITICAL - Generated secure keys)
    CRYPT_ALGORITHM: 'aes-256-cbc',
    CRYPT_KEY: keys.CRYPT_KEY,
    CRYPT_IV: keys.CRYPT_IV,
    
    // Email Configuration
    EMAIL: 'lmoria465@gmail.com',
    EMAIL_PASSWORD: 'byxtojuvzdfyuppm',
    EMAIL_PORT: '465',
    EMAIL_HOST: 'smtp.gmail.com',
    
    // JWT Configuration (Generated secure key)
    JWT_KEY: keys.JWT_KEY,
    JWT_EXPIRES_IN: '1d',
    
    // Host Configuration (Update these with your actual Railway URLs)
    BACKEND_HOST: 'https://your-backend.railway.app',
    FRONTEND_HOST: 'https://your-frontend.railway.app',
    
    // API Keys
    BARD_API_KEY: 'AIzaSyDzQo5Rr4FZYRFGRIV8-Rb8OeKvBoBPdv4',
    OCR_API_KEY: 'K81043669388957',
    
    // Password Configuration
    PASSWORD_SALT: '8',
    
    // Twilio Configuration
    ACCOUNT_SID: 'ACfef88ae0600c9adc53dd68c35a2cda54',
    AUTH_TOKEN_TWILLIO: '55faa7c3813733e384d62ae4a16f5992',
    TWILIO_WHATSAPP_NUMBER: '17067604303'
  };
  
  return railwayConfig;
}

// Create Railway CLI commands
function createRailwayCommands() {
  const config = createRailwayConfig();
  
  console.log('📋 Railway CLI Commands:');
  console.log('========================\n');
  
  console.log('# Set environment variables in Railway:');
  console.log('railway variables set NODE_ENV=production');
  console.log('railway variables set DATABASE_HOST=postgres');
  console.log('railway variables set DATABASE_NAME=cobraria_db');
  console.log('railway variables set DATABASE_USER=postgres');
  console.log('railway variables set DATABASE_PASSWORD=password');
  console.log('railway variables set DATABASE_PORT=5432');
  console.log('railway variables set ENDPOINT_DATABASE=postgres');
  console.log('railway variables set DATABASE_URL=postgresql://postgres:password@postgres:5432/cobraria_db');
  console.log('railway variables set MONGO_URL=mongodb://mongo:27017/cobraria');
  console.log('railway variables set CRYPT_ALGORITHM=aes-256-cbc');
  console.log(`railway variables set CRYPT_KEY=${config.CRYPT_KEY}`);
  console.log(`railway variables set CRYPT_IV=${config.CRYPT_IV}`);
  console.log('railway variables set EMAIL=lmoria465@gmail.com');
  console.log('railway variables set EMAIL_PASSWORD=byxtojuvzdfyuppm');
  console.log('railway variables set EMAIL_PORT=465');
  console.log('railway variables set EMAIL_HOST=smtp.gmail.com');
  console.log(`railway variables set JWT_KEY=${config.JWT_KEY}`);
  console.log('railway variables set JWT_EXPIRES_IN=1d');
  console.log('railway variables set BACKEND_HOST=https://your-backend.railway.app');
  console.log('railway variables set FRONTEND_HOST=https://your-frontend.railway.app');
  console.log('railway variables set BARD_API_KEY=AIzaSyDzQo5Rr4FZYRFGRIV8-Rb8OeKvBoBPdv4');
  console.log('railway variables set OCR_API_KEY=K81043669388957');
  console.log('railway variables set PASSWORD_SALT=8');
  console.log('railway variables set ACCOUNT_SID=ACfef88ae0600c9adc53dd68c35a2cda54');
  console.log('railway variables set AUTH_TOKEN_TWILLIO=55faa7c3813733e384d62ae4a16f5992');
  console.log('railway variables set TWILIO_WHATSAPP_NUMBER=17067604303');
  
  console.log('\n# Deploy to Railway:');
  console.log('railway deploy');
  
  return config;
}

// Create JSON configuration file
function createConfigFile() {
  const config = createRailwayConfig();
  const configPath = path.join(__dirname, '..', 'railway-config.json');
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`\n📄 Configuration saved to: ${configPath}`);
  
  return config;
}

// Create shell script for automation
function createShellScript() {
  const config = createRailwayConfig();
  
  const shellScript = `#!/bin/bash

# Railway Production Setup Script
# Generated automatically - DO NOT EDIT MANUALLY

echo "🚀 Setting up Railway production environment..."

# Set environment variables
railway variables set NODE_ENV=production
railway variables set DATABASE_HOST=postgres
railway variables set DATABASE_NAME=cobraria_db
railway variables set DATABASE_USER=postgres
railway variables set DATABASE_PASSWORD=password
railway variables set DATABASE_PORT=5432
railway variables set ENDPOINT_DATABASE=postgres
railway variables set DATABASE_URL=postgresql://postgres:password@postgres:5432/cobraria_db
railway variables set MONGO_URL=mongodb://mongo:27017/cobraria
railway variables set CRYPT_ALGORITHM=aes-256-cbc
railway variables set CRYPT_KEY=${config.CRYPT_KEY}
railway variables set CRYPT_IV=${config.CRYPT_IV}
railway variables set EMAIL=lmoria465@gmail.com
railway variables set EMAIL_PASSWORD=byxtojuvzdfyuppm
railway variables set EMAIL_PORT=465
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set JWT_KEY=${config.JWT_KEY}
railway variables set JWT_EXPIRES_IN=1d
railway variables set BACKEND_HOST=https://your-backend.railway.app
railway variables set FRONTEND_HOST=https://your-frontend.railway.app
railway variables set BARD_API_KEY=AIzaSyDzQo5Rr4FZYRFGRIV8-Rb8OeKvBoBPdv4
railway variables set OCR_API_KEY=K81043669388957
railway variables set PASSWORD_SALT=8
railway variables set ACCOUNT_SID=ACfef88ae0600c9adc53dd68c35a2cda54
railway variables set AUTH_TOKEN_TWILLIO=55faa7c3813733e384d62ae4a16f5992
railway variables set TWILIO_WHATSAPP_NUMBER=17067604303

echo "✅ Environment variables set successfully!"
echo "🚀 Deploying to Railway..."

# Deploy to Railway
railway deploy

echo "🎉 Railway deployment completed!"
echo "📊 Check your Railway dashboard for deployment status"
`;

  const scriptPath = path.join(__dirname, '..', 'deploy-railway.sh');
  fs.writeFileSync(scriptPath, shellScript);
  fs.chmodSync(scriptPath, '755'); // Make executable
  
  console.log(`📜 Shell script created: ${scriptPath}`);
  console.log('💡 Run: chmod +x deploy-railway.sh && ./deploy-railway.sh');
  
  return scriptPath;
}

// Main execution
function main() {
  try {
    console.log('🔧 Creating Railway configuration...\n');
    
    // Create all configuration files
    createConfigFile();
    createShellScript();
    createRailwayCommands();
    
    console.log('\n🎉 Railway automation setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Install Railway CLI: npm install -g @railway/cli');
    console.log('2. Login to Railway: railway login');
    console.log('3. Link your project: railway link');
    console.log('4. Run deployment: ./deploy-railway.sh');
    console.log('\n🚀 Your production environment will be ready!');
    
  } catch (error) {
    console.error('❌ Error creating Railway configuration:', error.message);
    process.exit(1);
  }
}

// Run the automation
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureKeys,
  createRailwayConfig,
  createRailwayCommands,
  createConfigFile,
  createShellScript
};
