@echo off
REM Convenient script to start the Cortex CLI after building on Windows

if not exist "dist" (
    echo Dist folder not found. Running build...
    npm run build
)

node .\bin\cortex.js
