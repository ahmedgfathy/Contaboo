#!/bin/bash

echo "🔧 Setting up Vercel Environment Variables..."
echo ""

# Set the DATABASE_URL for Vercel production
echo "Setting DATABASE_URL..."
vercel env add DATABASE_URL production <<< "postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo ""
echo "Setting VITE_API_URL..."
vercel env add VITE_API_URL production <<< "/api"

echo ""
echo "Setting NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "🚀 Redeploying to apply changes..."
vercel --prod

echo ""
echo "✅ Deployment complete! Your site should now have data."
echo "🌐 Visit: https://contaboo.vercel.app"
