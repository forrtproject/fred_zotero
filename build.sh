#!/bin/bash

# Build Script for Zotero Replication Checker
# Builds XPI from addon/ folder

echo "========================================"
echo "Building Zotero Replication Checker XPI"
echo "========================================"
echo ""

# Check we're in the right directory
if [ ! -d "addon" ]; then
    echo "❌ ERROR: addon/ directory not found"
    echo "Run this script from the plugin root directory"
    exit 1
fi

if [ ! -f "addon/manifest.json" ] || [ ! -f "addon/bootstrap.js" ]; then
    echo "❌ ERROR: addon/manifest.json or addon/bootstrap.js not found"
    exit 1
fi

echo "✓ Found addon/ directory"
echo ""

# Clean old build
echo "Cleaning old XPI..."
rm -f replication-checker.xpi

# Create XPI from addon/ folder
echo "Creating XPI from addon/ folder..."
cd addon
zip -r ../replication-checker.xpi \
  bootstrap.js \
  manifest.json \
  content/ \
  locale/ \
  data/ \
  -x "*.DS_Store" \
  -x "*/__pycache__/*"

cd ..

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✓ Build complete: replication-checker.xpi"
echo ""

# Verify structure
echo "Verifying XPI structure..."
echo "First 20 files:"
unzip -l replication-checker.xpi | head -25

echo ""
echo "Critical files check:"
unzip -l replication-checker.xpi | grep -E "(bootstrap.js|manifest.json|index.js)" | head -5

echo ""
echo "========================================"
echo "✅ Build Complete!"
echo "========================================"
echo ""
echo "File: $(pwd)/replication-checker.xpi"
echo "Size: $(du -h replication-checker.xpi | cut -f1)"
echo ""
echo "Installation:"
echo "1. Zotero → Tools → Plugins"
echo "2. Gear icon → Install Plugin From File"
echo "3. Select replication-checker.xpi"
echo "4. Restart Zotero"
echo ""
echo "Debug:"
echo "- Help → Debug Output Logging → Enable"
echo "- Help → Show Debug Output"
echo "- Look for: 'ReplicationChecker: === Starting up ==='"
echo ""
