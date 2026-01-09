#!/bin/bash

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
railway variables set CRYPT_KEY=43df6f9284cb5aac9026ec8ffddb54149a95756841750423374e31fe46cb38d9
railway variables set CRYPT_IV=a194095aba5e0b82cabd7327595d2c1e
railway variables set EMAIL=lmoria465@gmail.com
railway variables set EMAIL_PASSWORD=byxtojuvzdfyuppm
railway variables set EMAIL_PORT=465
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set JWT_KEY=Y3VGQkb5El1q5rkLUiZAaAj63+RkfvGKnMEu2jMnaYFjU5h0eSOvSqUN7jNhbpST3MYaS1pWVdnYG+ptBBmHXw==
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
