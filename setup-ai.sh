#!/bin/bash

# 🤖 AI Setup Script for Real Estate Chat Search Application
# This script helps you configure AI features quickly

echo "🚀 Setting up AI features for Real Estate Chat Search Application..."
echo "=================================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created successfully!"
else
    echo "📄 .env.local already exists"
fi

# Check if OpenAI API key is configured
if grep -q "your_openai_api_key_here" .env.local; then
    echo ""
    echo "🔑 OpenAI API Key Configuration Required"
    echo "========================================="
    echo "To enable AI features, you need to:"
    echo "1. Get an API key from: https://platform.openai.com/api-keys"
    echo "2. Replace 'your_openai_api_key_here' in .env.local with your actual API key"
    echo ""
    echo "Example:"
    echo "VITE_OPENAI_API_KEY=sk-your-actual-api-key-here"
    echo ""
    echo "💡 After adding your API key, restart the application with: npm run dev"
else
    echo "✅ OpenAI API key appears to be configured"
fi

# Check if openai package is installed
if npm list openai &> /dev/null; then
    echo "✅ OpenAI package is installed"
else
    echo "📦 Installing OpenAI package..."
    npm install openai
    echo "✅ OpenAI package installed successfully!"
fi

echo ""
echo "🎯 AI Features Available:"
echo "========================"
echo "• 🤖 AI Chat Assistant - Interactive Q&A about properties"
echo "• 📊 AI Dashboard - Intelligent market analysis"
echo "• 🔍 Smart Search - AI-powered property search"
echo "• 📈 Market Trends - AI-generated trend analysis"
echo "• 💡 Property Recommendations - Personalized suggestions"
echo "• 📱 WhatsApp Message Processing - Extract property details"
echo ""
echo "🌟 Look for the sparkling blue button on your homepage!"
echo ""
echo "📖 For detailed setup instructions, see: AI_IMPLEMENTATION_GUIDE.md"
echo ""
echo "🚀 Ready to start? Run: npm run dev"
