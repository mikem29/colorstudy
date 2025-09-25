#!/bin/bash

# Server setup script for Huemixy deployment on sabrehawk
# Run this script on the server to set up the environment

SERVER_USER=$(whoami)
APP_DIR="/var/www/huemixy"
DB_NAME="huemixy"

echo "🚀 Setting up Huemixy on sabrehawk server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $SERVER_USER:$SERVER_USER $APP_DIR
echo "✅ Directory created: $APP_DIR"

# Set up database
echo "🗄️  Setting up MySQL database..."
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
USE $DB_NAME;
source $APP_DIR/mysql/init/01-production-schema.sql;
EOF
echo "✅ Database $DB_NAME created and configured"

# Copy nginx configuration
echo "🌐 Setting up nginx configuration..."
sudo cp $APP_DIR/nginx-huemixy.conf /etc/nginx/sites-available/huemixy.com
sudo ln -sf /etc/nginx/sites-available/huemixy.com /etc/nginx/sites-enabled/
echo "✅ Nginx configuration installed"

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors - please check"
    exit 1
fi

# Set up SSL certificate (comment out if not ready)
echo "🔒 Setting up SSL certificate..."
echo "Run: sudo certbot --nginx -d huemixy.com -d www.huemixy.com"
echo "This step requires manual intervention - run after DNS is configured"

# Set up PM2 if not already done
echo "⚙️  Setting up PM2 ecosystem..."
cd $APP_DIR
pm2 delete huemixy 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "✅ PM2 ecosystem configured"

# Create log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/huemixy << EOF
/var/www/huemixy/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 $SERVER_USER $SERVER_USER
    postrotate
        pm2 reload huemixy
    endscript
}
EOF
echo "✅ Log rotation configured"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Server setup completed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Next steps:"
echo "1. Point DNS for huemixy.com to this server"
echo "2. Run: sudo certbot --nginx -d huemixy.com -d www.huemixy.com"
echo "3. Test SSL: sudo nginx -s reload"
echo "4. Deploy application: ./deploy.sh"
echo
echo "Useful commands:"
echo "- Check app status: pm2 status huemixy"
echo "- View logs: pm2 logs huemixy"
echo "- Restart app: pm2 restart huemixy"
echo "- Check nginx: sudo nginx -t && sudo nginx -s reload"