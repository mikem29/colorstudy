#!/bin/bash

# Deploy script for Huemixy (Color Study) application
# Builds locally and uploads to sabrehawk server

set -e  # Exit on any error

SERVER="sabrehawk"
REMOTE_PATH="/var/www/huemixy"
PROJECT_DIR="/Volumes/X9 Pro/Projects/MicroSass/colorstudy/svelte-app"

echo "🎨 Building Huemixy application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build the project
cd "$PROJECT_DIR"
npm run build

echo "✅ Build completed successfully!"
echo

echo "📦 Creating deployment archive..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create compressed archive including production config
tar czf build.tar.gz build/ package.json package-lock.json ecosystem.config.js nginx-huemixy.conf mysql/ 2>/dev/null || tar czf build.tar.gz build/ package.json package-lock.json ecosystem.config.js nginx-huemixy.conf mysql/
echo "✅ Archive created: build.tar.gz"

# Get file size for progress indication
FILE_SIZE=$(du -h build.tar.gz | cut -f1)
echo "📊 Archive size: $FILE_SIZE"
echo

echo "🚀 Uploading to server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Upload with progress
rsync -avz --progress build.tar.gz $SERVER:$REMOTE_PATH/

echo
echo "📂 Extracting on server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract and cleanup on server
ssh $SERVER "cd $REMOTE_PATH && echo 'Extracting build.tar.gz...' && tar xzf build.tar.gz && rm build.tar.gz && echo '✅ Extraction completed'"

echo
echo "📦 Installing dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install production dependencies on server
ssh $SERVER "cd $REMOTE_PATH && npm install --production && echo '✅ Dependencies installed'"

echo
echo "🔄 Restarting application..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Restart PM2 process with updated code
ssh $SERVER "pm2 restart huemixy"
echo "✅ Restarted PM2 process"

echo "⏳ Waiting for application to start..."
sleep 5

# Check if app is running
if ssh $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:3006" | grep -q "200\|302"; then
    echo "✅ Application is running on port 3006"

    # Reload nginx to ensure it reconnects to the backend
    echo "🔄 Reloading nginx configuration..."
    ssh $SERVER "sudo nginx -s reload"
    echo "✅ Nginx reloaded successfully"

    echo "🌐 Site available at: https://huemixy.com"
else
    echo "⚠️  Application may not have started properly. Check logs:"
    echo "   ssh $SERVER 'tail -f $REMOTE_PATH/app.log'"
fi

echo
echo "🧹 Cleaning up local files..."
rm build.tar.gz

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Deployment completed successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"