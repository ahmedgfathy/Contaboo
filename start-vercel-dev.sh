#!/bin/bash

echo "🚀 Starting Vercel development server with serverless functions..."
echo "This will run the exact same setup as production without needing local backend"
echo ""

# Kill any existing processes on ports 3000-3002
echo "🔄 Cleaning up any existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true  
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo "✅ Starting Vercel dev server..."
echo "📡 API endpoints will be available at http://localhost:3000/api/*"
echo "🌐 Frontend will be available at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"

# Start Vercel dev server which handles both frontend and serverless functions
vercel dev --listen 3000
