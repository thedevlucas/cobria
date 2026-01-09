# Railway Production Setup Script (PowerShell)
# Generated automatically - DO NOT EDIT MANUALLY

Write-Host "🚀 Setting up Railway production environment..." -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
    Write-Host "✅ Railway CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
}

# Set environment variables
Write-Host "🔧 Setting environment variables..." -ForegroundColor Yellow

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
railway variables set CRYPT_KEY=5b61478b1d9ba818698cb624f0b3abfa2ce58a0159719a65d94904fc1ed6655b
railway variables set CRYPT_IV=302ae0b00f918f31d029c7f91a301422
railway variables set EMAIL=lmoria465@gmail.com
railway variables set EMAIL_PASSWORD=byxtojuvzdfyuppm
railway variables set EMAIL_PORT=465
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set JWT_KEY=Vol2nOdVNQi7x/2jGadOHBoq/cXvr5XtjeMYcuScz0mlDa56/p0kMxkQBq0Hw3nTzZ4Ptci1ky3iWv1Z92PDLQ==
railway variables set JWT_EXPIRES_IN=1d
railway variables set BACKEND_HOST=https://your-backend.railway.app
railway variables set FRONTEND_HOST=https://your-frontend.railway.app
railway variables set BARD_API_KEY=AIzaSyDzQo5Rr4FZYRFGRIV8-Rb8OeKvBoBPdv4
railway variables set OCR_API_KEY=K81043669388957
railway variables set PASSWORD_SALT=8
railway variables set ACCOUNT_SID=ACfef88ae0600c9adc53dd68c35a2cda54
railway variables set AUTH_TOKEN_TWILLIO=55faa7c3813733e384d62ae4a16f5992
railway variables set TWILIO_WHATSAPP_NUMBER=17067604303

Write-Host "✅ Environment variables set successfully!" -ForegroundColor Green
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Yellow

# Deploy to Railway
railway deploy

Write-Host "🎉 Railway deployment completed!" -ForegroundColor Green
Write-Host "📊 Check your Railway dashboard for deployment status" -ForegroundColor Cyan
