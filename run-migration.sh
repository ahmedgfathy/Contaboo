#!/bin/bash

echo "🚀 Starting Real Estate Chat App Migration..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found. Please set it in .env file."
    exit 1
fi

echo "📊 Running database migration..."

# Run the migration SQL
psql "$DATABASE_URL" -f database/complete-migration.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully!"
else
    echo "❌ Database migration failed!"
    exit 1
fi

# Test the migration
echo "🧪 Testing migration..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) as total_messages FROM chat_messages;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) as structured_properties FROM structured_properties;"
psql "$DATABASE_URL" -c "SELECT purpose, COUNT(*) FROM chat_messages WHERE purpose IS NOT NULL GROUP BY purpose;"

echo "✅ Migration and testing completed!"

# Optional: Restart development server
if [ "$1" = "--restart-dev" ]; then
    echo "🔄 Restarting development server..."
    pkill -f "vite\|node.*dev"
    npm run dev &
    echo "🎉 Development server restarted!"
fi

echo "🎯 Migration Summary:"
echo "   - Added structured_properties table"
echo "   - Enhanced chat_messages with real estate fields"
echo "   - Created automatic data extraction triggers"
echo "   - Added performance indexes"
echo "   - Created analytics view"
echo ""
echo "Next steps:"
echo "1. Update frontend components (auto-running...)"
echo "2. Test the application"
echo "3. Deploy to production"
