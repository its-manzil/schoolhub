#!/bin/bash

# Script to fix hardcoded localhost URLs in TypeScript/React files

echo "Starting to fix hardcoded localhost URLs..."

# Find all .ts and .tsx files with hardcoded localhost:2056
find frontend -name "*.ts" -o -name "*.tsx" | while read file; do
    if grep -q "http://localhost:2056" "$file"; then
        echo "Processing: $file"
        
        # Add API_BASE constant after imports if not already present
        if ! grep -q "const API_BASE" "$file"; then
            sed -i '/^import/a\
\
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '\''http://localhost:2056'\'';' "$file"
        fi
        
        # Replace hardcoded localhost URLs with API_BASE template literals
        sed -i "s/'\''http:\/\/localhost:2056'\''/\$\{API_BASE\}/g" "$file"
        
        echo "Fixed: $file"
    fi
done

echo "Completed fixing hardcoded localhost URLs!"
