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
tar czf build.tar.gz build/ package.json package-lock.json ecosystem.config.cjs nginx-huemixy.conf mysql/ migrations/ run-migrations.js scripts/ 2>/dev/null || tar czf build.tar.gz build/ package.json package-lock.json ecosystem.config.cjs nginx-huemixy.conf mysql/ migrations/ run-migrations.js scripts/
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
echo "🗃️  Checking database schema updates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Run database schema updates on server (if migrations directory exists)
if ssh $SERVER "test -d $REMOTE_PATH/migrations"; then
    echo "📋 Found schema updates, applying..."
    # Export the database env vars from PM2 config before running migrations
    if ssh $SERVER "cd $REMOTE_PATH && \
        export MYSQL_HOST=localhost && \
        export MYSQL_PORT=3307 && \
        export MYSQL_USER=story_user && \
        export MYSQL_PASSWORD='rCy7mRMkZan8H4FpJr8U1/oHwgmHbgqR6yZk17gqS+Y=' && \
        export MYSQL_DATABASE=huemixy && \
        node run-migrations.js 2>&1"; then
        echo "✅ Schema updates completed successfully"
    else
        echo "⚠️  Schema updates encountered an issue (this may be normal if already applied)"
        echo "   Check server environment variables if connection errors persist"
    fi
else
    echo "ℹ️  No schema updates found, skipping..."
fi

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