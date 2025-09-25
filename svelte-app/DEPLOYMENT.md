# Huemixy Deployment Guide

## Overview
This guide covers deploying the Huemixy (Color Study) application to the sabrehawk server at huemixy.com.

## Prerequisites
- SSH access to sabrehawk server
- Domain huemixy.com pointed to sabrehawk server IP
- MySQL installed on sabrehawk
- Node.js, PM2, and nginx installed on sabrehawk

## Initial Server Setup

1. **Upload server setup script to sabrehawk:**
   ```bash
   scp server-setup.sh sabrehawk:/tmp/
   ```

2. **Run server setup on sabrehawk:**
   ```bash
   ssh sabrehawk
   chmod +x /tmp/server-setup.sh
   sudo /tmp/server-setup.sh
   ```

3. **Configure SSL certificate:**
   ```bash
   sudo certbot --nginx -d huemixy.com -d www.huemixy.com
   sudo nginx -s reload
   ```

## Application Deployment

### Automated Deployment
From your local development machine:

```bash
# Make sure you're in the svelte-app directory
cd /Volumes/X9\ Pro/Projects/MicroSass/colorstudy/svelte-app

# Deploy the application
./deploy.sh
```

### Manual Deployment Steps
If you need to deploy manually:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Create deployment archive:**
   ```bash
   tar czf build.tar.gz build/ ecosystem.config.js nginx-huemixy.conf mysql/
   ```

3. **Upload to server:**
   ```bash
   rsync -avz build.tar.gz sabrehawk:/var/www/huemixy/
   ```

4. **Extract and restart on server:**
   ```bash
   ssh sabrehawk "cd /var/www/huemixy && tar xzf build.tar.gz && rm build.tar.gz && pm2 restart huemixy"
   ```

## Database Setup

### Production Database
- Database name: `huemixy`
- Tables: user, session, artboards, images, swatches
- Schema: `/mysql/init/01-production-schema.sql`

### Environment Variables
The application uses these environment variables in production:
- `MYSQL_HOST=localhost`
- `MYSQL_PORT=3306`
- `MYSQL_USER=root`
- `MYSQL_PASSWORD=rootpassword`
- `MYSQL_DATABASE=huemixy`
- `PORT=3006`

## Server Configuration

### PM2 Process
- Process name: `huemixy`
- Port: `3006`
- Config: `ecosystem.config.js`
- Logs: `/var/www/huemixy/app.log`

### Nginx Configuration
- Config file: `/etc/nginx/sites-available/huemixy.com`
- Proxy target: `http://localhost:3006`
- SSL certificates via Let's Encrypt

## Monitoring and Maintenance

### Useful Commands
```bash
# Check application status
pm2 status huemixy

# View application logs
pm2 logs huemixy

# Restart application
pm2 restart huemixy

# Check nginx status
sudo nginx -t
sudo nginx -s reload

# View nginx logs
sudo tail -f /var/log/nginx/huemixy.access.log
sudo tail -f /var/log/nginx/huemixy.error.log
```

### Log Rotation
Logs are automatically rotated daily and kept for 14 days via logrotate configuration.

## Troubleshooting

### Application Won't Start
1. Check PM2 logs: `pm2 logs huemixy`
2. Verify database connection
3. Check port 3006 availability: `netstat -tulpn | grep 3006`

### Database Issues
1. Verify MySQL is running: `sudo systemctl status mysql`
2. Test database connection: `mysql -u root -p huemixy`
3. Check database tables exist

### SSL Certificate Issues
1. Renew certificate: `sudo certbot renew`
2. Reload nginx: `sudo nginx -s reload`
3. Check certificate status: `sudo certbot certificates`

## Development vs Production

### Key Differences
- Database: `colorstudy` (dev) vs `huemixy` (prod)
- Port: `5173` (dev) vs `3006` (prod)
- SSL: disabled (dev) vs enabled (prod)
- Domain: `localhost` (dev) vs `huemixy.com` (prod)

### Configuration Files
- Development: Uses local SQLite or MySQL
- Production: Uses MySQL with production credentials
- Environment detection via `$app/environment.dev`