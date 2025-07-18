#!/bin/bash

# Start Local Backend Server for Contaboo Real Estate CRM
# This script starts the backend server that connects to Neon PostgreSQL

echo "🚀 Starting Contaboo Backend Server"
echo "📊 Connecting to Neon PostgreSQL Database"
echo "🌐 Server will run on http://localhost:3001"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please ensure DATABASE_URL is configured."
    exit 1
fi

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the backend server
echo "🔥 Starting backend server..."
echo "📡 Frontend should use: VITE_API_URL=http://localhost:3001/api"
echo ""
echo "Available endpoints:"
echo "  - GET http://localhost:3001/api/health"
echo "  - GET http://localhost:3001/api/stats"
echo "  - GET http://localhost:3001/api/search-all"
echo "  - GET http://localhost:3001/api/messages"
echo "  - GET http://localhost:3001/api/dropdowns"
echo ""

# Start the server
node backend/dev-server.js
