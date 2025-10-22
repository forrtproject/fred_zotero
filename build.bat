@echo off
echo ========================================
echo Building Zotero Replication Checker XPI
echo ========================================
echo.

REM Check if addon directory exists
if not exist "addon\" (
    echo ❌ ERROR: addon/ directory not found
    echo Run this script from the plugin root directory
    exit /b 1
)

REM Check for critical files
if not exist "addon\manifest.json" (
    echo ❌ ERROR: addon\manifest.json not found
    exit /b 1
)
if not exist "addon\bootstrap.js" (
    echo ❌ ERROR: addon\bootstrap.js not found
    exit /b 1
)

echo ✓ Found addon/ directory
echo.

REM Clean old build
echo Cleaning old XPI...
if exist "replication-checker.xpi" del "replication-checker.xpi"

REM Create XPI from addon/ folder
echo Creating XPI from addon/ folder...
cd addon
"C:\Program Files\7-Zip\7z.exe" a -r -tzip ../replication-checker.xpi bootstrap.js manifest.json content/* locale/* data/* -x!*.DS_Store -x!*/__pycache__/*
cd ..

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    exit /b 1
)

echo.
echo ✓ Build complete: replication-checker.xpi
echo.

REM Verify structure
echo Verifying XPI structure...
echo First 20 files:
"C:\Program Files\7-Zip\7z.exe" l replication-checker.xpi | findstr /N "Name" | more +2 | head -25

echo.
echo Critical files check:
"C:\Program Files\7-Zip\7z.exe" l replication-checker.xpi | findstr /R "bootstrap.js\|manifest.json\|index.js"

echo.
echo ========================================
echo ✅ Build Complete!
echo ========================================
echo.
echo File: %CD%\replication-checker.xpi
for %%F in (replication-checker.xpi) do set size=%%~zF
echo Size: %size% bytes
echo.

echo Installation:
echo 1. Zotero → Tools → Plugins
echo 2. Gear icon → Install Plugin From File
echo 3. Select replication-checker.xpi
echo 4. Restart Zotero
echo.

echo Debug:
echo - Help → Debug Output Logging → Enable
echo - Help → Show Debug Output
echo - Look for: 'ReplicationChecker: === Starting up ==='
echo.

pause