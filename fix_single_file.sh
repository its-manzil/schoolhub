#!/bin/bash

# Fix hardcoded localhost URLs in a single file
FILE="$1"

if [ ! -f "$FILE" ]; then
    echo "Error: File $FILE does not exist"
    exit 1
fi

echo "Fixing $FILE..."

# Check if API_BASE already exists
if grep -q "const API_BASE" "$FILE"; then
    echo "API_BASE already exists in $FILE"
else
    # Add API_BASE after the last import statement
    sed -i '/^import/a\
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '\''http://localhost:2056'\'';' "$FILE"
fi

# Replace hardcoded localhost URLs with template literals
sed -i "s/'\''http:\/\/localhost:2056'\''/\$\{API_BASE\}/g" "$FILE"

echo "Fixed $file"
