#!/bin/bash
# Wrapper script to run the mixing queue processor
# This ensures the script runs in the correct directory with proper environment

cd "$(dirname "$0")/.."

# Load environment variables if .env exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Run the TypeScript file using tsx (if available) or compile and run
if command -v tsx &> /dev/null; then
  tsx scripts/process-mixing-queue.ts
elif command -v ts-node &> /dev/null; then
  ts-node scripts/process-mixing-queue.ts
else
  # Fallback: try to run the compiled JS version
  if [ -f scripts/process-mixing-queue.js ]; then
    node scripts/process-mixing-queue.js
  else
    echo "Error: tsx, ts-node, or compiled JS file not found"
    exit 1
  fi
fi
