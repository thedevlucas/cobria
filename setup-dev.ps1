# Development Setup Script for COBRIA Backend (PowerShell)
Write-Host "🚀 Setting up COBRIA Backend for development..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Check if all required modules are available
Write-Host "🔍 Checking module availability..." -ForegroundColor Cyan

# Test critical modules
node -e "
try {
  require('express');
  console.log('✅ Express: OK');
} catch(e) {
  console.log('❌ Express: Missing');
}

try {
  require('mongoose');
  console.log('✅ Mongoose: OK');
} catch(e) {
  console.log('❌ Mongoose: Missing');
}

try {
  require('bcrypt');
  console.log('✅ Bcrypt: OK');
} catch(e) {
  console.log('❌ Bcrypt: Missing');
}

try {
  require('xlsx');
  console.log('✅ XLSX: OK');
} catch(e) {
  console.log('❌ XLSX: Missing');
}

try {
  require('zod');
  console.log('✅ Zod: OK');
} catch(e) {
  console.log('❌ Zod: Missing');
}

try {
  require('ocr-space-api-wrapper');
  console.log('✅ OCR: OK');
} catch(e) {
  console.log('⚠️  OCR: Optional (fallback available)');
}
"

Write-Host "🎉 Development setup completed!" -ForegroundColor Green
Write-Host "💡 Run 'npm run dev' to start the development server" -ForegroundColor Cyan
