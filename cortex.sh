#!/bin/bash
# Convenient script to start the Cortex CLI after building
if [ ! -d "dist" ]; then
    echo "Dist folder not found. Running build..."
    npm run build
fi
node ./bin/cortex.js
