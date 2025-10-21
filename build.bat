@echo off
echo Building XPI...
"C:\Program Files\7-Zip\7z.exe" a -tzip replication-checker.xpi * -x!*.git* -x!docs\* -x!build.bat
echo XPI built: replication-checker.xpi

echo ""
echo "Installation instructions:"
echo "1. Open Zotero 7"
echo "2. Go to Tools → Plugin"
echo "3. Click gear icon → Install Plugin From File"
echo "4. Select replication-checker.xpi"
echo "5. Restart Zotero"
pause