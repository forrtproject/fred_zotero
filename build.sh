#!/bin/bash

# Build script for Zotero Replication Checker plugin

echo "Building Zotero Replication Checker XPI..."

# Remove old XPI if exists
rm -f replication-checker.xpi

# Create XPI (which is just a ZIP file)
zip -r replication-checker.xpi \
  manifest.json \
  bootstrap.js \
  chrome.manifest \
  chrome/ \
  locale/ \
  data/ \
  -x "*.DS_Store" \
  -x "*/__pycache__/*"

echo ""
echo "Build complete: replication-checker.xpi"
echo ""
echo "Contents:"
unzip -l replication-checker.xpi

echo ""
echo "Installation instructions:"
echo "1. Open Zotero 7"
echo "2. Go to Tools → Add-ons"
echo "3. Click gear icon → Install Add-on From File"
echo "4. Select replication-checker.xpi"
echo "5. Restart Zotero"
