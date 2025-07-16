#!/bin/bash

# Quick test script to check if Vercel backend is working
echo "🧪 Testing Vercel Backend Connection"
echo "====================================="

echo ""
echo "1. Testing Health Endpoint..."
curl -s https://contaboo.com/api/health | jq '.' 2>/dev/null || curl -s https://contaboo.com/api/health

echo ""
echo "2. Testing Properties Endpoint..."
curl -s "https://contaboo.com/api/properties?limit=1" | jq '.data[0].id' 2>/dev/null || echo "Properties endpoint test (first property ID)"

echo ""
echo "3. Testing Stats Endpoint..."
curl -s https://contaboo.com/api/stats" | jq '.[0]' 2>/dev/null || echo "Stats endpoint test"

echo ""
echo "4. Current Frontend Configuration:"
echo "   - Production API URL should be: /api"
echo "   - This means: https://contaboo.com/api/*"

echo ""
echo "🔧 If any tests fail, follow these steps:"
echo "   1. Set DATABASE_URL in Vercel environment variables"
echo "   2. Set VITE_API_URL=/api in Vercel environment variables"
echo "   3. Redeploy using: ./deploy-vercel.sh"
