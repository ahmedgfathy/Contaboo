#!/bin/bash

# Start Backend Server on Production Server
# Run this script on your server at IP 35.193.103.185

echo "🚀 Starting Contaboo Backend Server..."
echo "📍 Server IP: 35.193.103.185"
echo "🔌 Port: 3001"

# Set environment variables
export HOST=0.0.0.0
export PORT=3001
export NODE_ENV=production

# Kill any existing processes on port 3001
echo "🔄 Stopping any existing processes on port 3001..."
pkill -f "node.*simple-backend.js" 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start the server
echo "🌟 Starting backend server..."
echo "🔗 Frontend should connect to: http://35.193.103.185:3001/api"
echo "📱 Ready for WhatsApp imports and Vercel frontend connection!"
echo ""

# Start server (use nohup for background execution)
nohup node simple-backend.js > backend.log 2>&1 &

# Get the process ID
PID=$!
echo "✅ Backend server started with PID: $PID"
echo "📋 Log file: backend/backend.log"
echo ""
echo "🔍 To check server status:"
echo "   curl http://35.193.103.185:3001/api/health"
echo ""
echo "🛑 To stop the server:"
echo "   kill $PID"
echo "   OR: pkill -f 'node.*simple-backend.js'"
echo ""
echo "📊 To view logs:"
echo "   tail -f backend/backend.log"

# Wait a moment and test
sleep 3
echo "🧪 Testing server health..."
curl -s http://localhost:3001/api/health || echo "⚠️  Server not responding locally, check logs"
