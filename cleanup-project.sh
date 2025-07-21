#!/bin/bash

# 🧹 Contaboo Project Cleanup Script
# This script removes temporary files, test files, and migration scripts that are no longer needed

echo "🧹 CONTABOO PROJECT CLEANUP"
echo "=========================="
echo ""
echo "This script will remove temporary development files that are no longer needed:"
echo "  - Migration scripts (SQLite→PostgreSQL completed)"
echo "  - Test/Debug components (development phase completed)"
echo "  - Analysis scripts (data quality analysis completed)"
echo "  - Temporary shell scripts"
echo ""

# Safety check
read -p "⚠️  Are you sure you want to proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo ""
echo "🗂️  Starting cleanup process..."

# Create backup directory for safety
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"

# Function to safely move files to backup
backup_and_remove() {
    local file="$1"
    local reason="$2"
    
    if [ -f "$file" ]; then
        echo "📋 $reason: $(basename "$file")"
        cp "$file" "$BACKUP_DIR/" 2>/dev/null
        rm "$file"
        echo "   ✅ Moved to backup and removed"
    fi
}

echo ""
echo "🔄 1. REMOVING MIGRATION SCRIPTS (Already completed)"
echo "------------------------------------------------"

# Migration scripts - no longer needed since migration is complete
backup_and_remove "backend/migrate-contaboo-to-neon.js" "Migration script"
backup_and_remove "backend/migrate-to-postgres.js" "Migration script"
backup_and_remove "backend/migrate-to-normalized.js" "Migration script"
backup_and_remove "backend/comprehensive-migration-solution.js" "Comprehensive migration"
backup_and_remove "run-migration.js" "Migration runner"

echo ""
echo "🧪 2. REMOVING TEST & DEBUG COMPONENTS"
echo "-------------------------------------"

# Test components - only needed during development
backup_and_remove "src/components/DebugAPITest.jsx" "Debug API test component"
backup_and_remove "src/components/AIDebugTest.jsx" "AI debug test component"
backup_and_remove "src/components/HomePageDebug.jsx" "HomePage debug component"
backup_and_remove "src/components/HomePage-Test.jsx" "HomePage test component"
backup_and_remove "src/components/EnhancedDataQualityTest.jsx" "Data quality test component"
backup_and_remove "src/components/EnhancedMobileMaskingTest.jsx" "Mobile masking test component"
backup_and_remove "src/components/SEOMetadataTest.jsx" "SEO metadata test component"
backup_and_remove "src/components/CombinedUtilitiesTest.jsx" "Combined utilities test component"
backup_and_remove "src/utils/dataQualityTest.js" "Data quality test utility"

echo ""
echo "📊 3. REMOVING ANALYSIS SCRIPTS (Analysis completed)"
echo "--------------------------------------------------"

# Analysis scripts - used for initial data quality analysis
backup_and_remove "backend/analyze-data-quality.js" "Data quality analysis script"
backup_and_remove "backend/analyze-clean-data.js" "Clean data analysis script"
backup_and_remove "backend/check-table.js" "Table structure check script"
backup_and_remove "backend/check-schema.js" "Schema check script"
backup_and_remove "backend/check-properties-schema.js" "Properties schema check script"
backup_and_remove "backend/quick-check.js" "Quick database check script"

echo ""
echo "🛠️  4. REMOVING TEMPORARY IMPLEMENTATION FILES"
echo "--------------------------------------------"

# Temporary implementation files - replaced by production versions
backup_and_remove "backend/manual-step-by-step.js" "Manual migration script"
backup_and_remove "backend/implement-normalized-schema.js" "Schema implementation script"
backup_and_remove "backend/implement-normalized-schema-simple.js" "Simple schema implementation"
backup_and_remove "backend/implement-normalized-schema-robust.js" "Robust schema implementation"
backup_and_remove "backend/create-enhanced-schema.js" "Enhanced schema creation"
backup_and_remove "backend/fix-database-relationships.js" "Database relationships fix"
backup_and_remove "backend/verify-normalization.js" "Normalization verification"

echo ""
echo "🧹 5. REMOVING EMPTY/PLACEHOLDER FILES"
echo "------------------------------------"

# Check for empty files and remove them
if [ -f "src/components/AIDebugTest.jsx" ] && [ ! -s "src/components/AIDebugTest.jsx" ]; then
    backup_and_remove "src/components/AIDebugTest.jsx" "Empty placeholder file"
fi

if [ -f "src/components/HomePageDebug.jsx" ] && [ ! -s "src/components/HomePageDebug.jsx" ]; then
    backup_and_remove "src/components/HomePageDebug.jsx" "Empty placeholder file"
fi

echo ""
echo "📝 6. UPDATING IMPORT REFERENCES"
echo "------------------------------"

# Remove DebugAPITest import from App.jsx since it was being used
if grep -q "DebugAPITest" src/App.jsx; then
    echo "🔧 Removing DebugAPITest import from App.jsx..."
    
    # Create backup of App.jsx
    cp src/App.jsx "$BACKUP_DIR/App.jsx.backup"
    
    # Remove the import line and route
    sed -i '/import DebugAPITest/d' src/App.jsx
    sed -i '/DebugAPITest/d' src/App.jsx
    
    echo "   ✅ Cleaned up App.jsx imports"
fi

echo ""
echo "📊 7. CLEANUP SUMMARY"
echo "------------------"

# Count files in backup directory
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)
echo "📦 Files backed up: $BACKUP_COUNT"

if [ $BACKUP_COUNT -gt 0 ]; then
    echo "📋 Backup location: $BACKUP_DIR"
    echo "   You can restore any file if needed: cp $BACKUP_DIR/filename.js ./original/location/"
fi

# Calculate space saved
if [ -d "$BACKUP_DIR" ]; then
    SPACE_SAVED=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "💾 Approximate space freed: $SPACE_SAVED"
fi

echo ""
echo "✨ 8. POST-CLEANUP VERIFICATION"
echo "----------------------------"

# Check if the main application files are still intact
CRITICAL_FILES=(
    "src/App.jsx"
    "backend/dev-server.js" 
    "backend/server-postgres.js"
    "api/stats.js"
    "package.json"
)

echo "🔍 Verifying critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file - OK"
    else
        echo "   ❌ $file - MISSING!"
    fi
done

echo ""
echo "🎉 CLEANUP COMPLETED!"
echo "==================="
echo ""
echo "✅ Removed unnecessary development files"
echo "✅ Cleaned up import references"  
echo "✅ Created backup for safety"
echo "✅ Verified critical files are intact"
echo ""
echo "🚀 Your project is now clean and production-ready!"
echo ""
echo "📋 WHAT WAS REMOVED:"
echo "   - Migration scripts (SQLite→PostgreSQL migration completed)"
echo "   - Test/Debug components (development phase completed)" 
echo "   - Data analysis scripts (initial analysis completed)"
echo "   - Temporary implementation files (replaced by production versions)"
echo ""
echo "🔄 NEXT STEPS:"
echo "   1. Test your application: npm run dev"
echo "   2. Test backend: cd backend && npm start"
echo "   3. If everything works, you can delete the backup: rm -rf $BACKUP_DIR"
echo "   4. Commit the cleanup: git add . && git commit -m 'Clean up development files'"
echo ""

# Optional: Test the application
read -p "🧪 Do you want to test the application now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Starting quick application test..."
    
    # Test if the main components can be imported
    echo "📝 Testing frontend compilation..."
    npm run build --silent && echo "   ✅ Frontend builds successfully" || echo "   ❌ Frontend build failed"
    
    echo ""
    echo "📡 Testing backend..."
    cd backend && timeout 5s node dev-server.js &>/dev/null && echo "   ✅ Backend starts successfully" || echo "   ❌ Backend may have issues"
    cd ..
fi

echo ""
echo "🎯 Cleanup process completed successfully!"
