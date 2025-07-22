#!/bin/bash

# Complete Startup Guide for Contaboo Real Estate CRM
# This script helps you start both frontend and backend correctly

echo "🏢 Contaboo Real Estate CRM - Complete Startup Guide"
echo "=================================================="
echo ""

echo "📋 Your current configuration:"
echo "   Frontend: Configured to use local backend"
echo "   Backend: Needs to be started separately"
echo "   Database: Neon PostgreSQL"
echo ""

echo "🚀 STARTUP SEQUENCE:"
echo ""

echo "1️⃣  START BACKEND (Terminal 1):"
echo "   cd backend"
echo "   npm run dev"
echo "   ⏳ Wait for: 'Server running on port 3001'"
echo ""

echo "2️⃣  START FRONTEND (Terminal 2):"
echo "   npm run dev"
echo "   ⏳ Wait for: 'Local: http://localhost:5173'"
echo ""

echo "3️⃣  VERIFY CONNECTION:"
echo "   Open: http://localhost:5173"
echo "   Check: Should show 43K+ units"
echo ""

echo "🔧 ALTERNATIVE - Use Serverless Functions:"
echo "   1. Edit .env.local:"
echo "   2. Comment: # VITE_API_URL=http://localhost:3001/api"
echo "   3. Uncomment: VITE_API_URL=/api"
echo "   4. Run: npm run dev (no backend needed)"
echo ""

echo "📱 MOBILE APK BUILD:"
echo "   cd mobile-app"
echo "   ./build-apk.sh"
echo ""

echo "🎯 QUICK START (Run these commands):"
echo "----------------------------------------"
echo "Terminal 1: cd backend && npm run dev"
echo "Terminal 2: npm run dev"
echo "Browser: http://localhost:5173"
