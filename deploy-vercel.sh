#!/bin/bash

# Vercel Production Deployment Script
# This script ensures your backend serverless functions work with your frontend

echo "🚀 Deploying Contaboo to Vercel with Backend Support"
echo "=============================================="

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

echo "📋 Current environment variables:"
echo "VITE_API_URL=/api (serverless functions)"
echo "Database connection will use serverless functions"

# Build the project first
echo "🔨 Building the project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔧 IMPORTANT: Make sure to set these environment variables in Vercel Dashboard:"
echo "   1. Go to https://vercel.com/dashboard"
echo "   2. Select your contaboo project"
echo "   3. Go to Settings > Environment Variables"
echo "   4. Add these variables:"
echo ""
echo "   DATABASE_URL = your_neon_database_connection_string"
echo "   VITE_OPENAI_API_KEY = your_openai_api_key"
echo "   VITE_API_URL = /api"
echo ""
echo "🌐 Your site should now work at: https://contaboo.com"
echo "📡 Backend API will be available at: https://contaboo.com/api/*"
echo ""
echo "🔍 To test if backend is working:"
echo "   Visit: https://contaboo.com/api/health"
echo "   Should return: {\"status\": \"ok\", \"timestamp\": \"...\"}"
