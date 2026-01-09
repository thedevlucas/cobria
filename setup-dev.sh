#!/bin/bash

# Development Setup Script for COBRIA Backend
echo "🚀 Setting up COBRIA Backend for development..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Check if all required modules are available
echo "🔍 Checking module availability..."

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

echo "🎉 Development setup completed!"
echo "💡 Run 'npm run dev' to start the development server"
