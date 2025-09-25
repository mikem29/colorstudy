# SSL and Domain Setup Guide for Huemixy.com

## Overview

This guide covers the complete setup process for configuring huemixy.com and www.huemixy.com with SSL certificates on the sabrehawk server.

## Prerequisites

✅ **Already Complete:**
- Application deployed and running on port 3006
- MySQL database configured and schema created
- Nginx configuration files ready
- Temporary HTTP configuration installed

❌ **Still Needed:**
- DNS configuration to point domain to server
- SSL certificate generation
- Final nginx configuration with HTTPS redirects

## Step 1: DNS Configuration

### Required DNS Records

Point these DNS records to the sabrehawk server IP address:

```
A    huemixy.com        → [SABREHAWK_SERVER_IP]
A    www.huemixy.com    → [SABREHAWK_SERVER_IP]
```

Or use CNAME if preferred:
```
A    huemixy.com        → [SABREHAWK_SERVER_IP]
CNAME www.huemixy.com   → huemixy.com
```

**Note:** DNS propagation can take up to 24-48 hours, but typically completes within 1-2 hours.

### Verify DNS Propagation

Test DNS resolution:
```bash
# Test from your local machine
nslookup huemixy.com
nslookup www.huemixy.com

# Or use online tools:
# - whatsmydns.net
# - dnschecker.org
```

## Step 2: SSL Certificate Generation

### Automatic SSL Setup with Certbot

Once DNS is pointing to the server, run this command on sabrehawk:

```bash
sudo certbot --nginx -d huemixy.com -d www.huemixy.com --non-interactive --agree-tos --email admin@huemixy.com --redirect
```

This command will:
- Generate SSL certificates for both domains
- Automatically update nginx configuration
- Set up automatic HTTPS redirects
- Configure cert renewal

### Manual SSL Setup (if automatic fails)

If automatic setup fails, use these manual steps:

```bash
# Generate certificates only
sudo certbot certonly --nginx -d huemixy.com -d www.huemixy.com

# Then manually update nginx config
sudo cp /var/www/huemixy/nginx-huemixy.conf /etc/nginx/sites-available/huemixy.com
sudo nginx -t
sudo nginx -s reload
```

## Step 3: Nginx Configuration

### Final Production Configuration

The production nginx config (`/var/www/huemixy/nginx-huemixy.conf`) includes:

1. **HTTP → HTTPS redirect** for both domains
2. **Root domain → www redirect** (huemixy.com → www.huemixy.com)
3. **SSL configuration** with Let's Encrypt certificates
4. **Application proxy** to port 3006
5. **Security headers** and optimizations

### Configuration Structure

```nginx
# HTTP redirects (all traffic → https://www.huemixy.com)
server {
    listen 80;
    server_name huemixy.com www.huemixy.com;
    return 301 https://www.huemixy.com$request_uri;
}

# HTTPS root domain redirect (huemixy.com → www.huemixy.com)
server {
    listen 443 ssl http2;
    server_name huemixy.com;
    # SSL config...
    return 301 https://www.huemixy.com$request_uri;
}

# Main HTTPS server (www.huemixy.com)
server {
    listen 443 ssl http2;
    server_name www.huemixy.com;
    # SSL config + application proxy...
}
```

### Apply Final Configuration

```bash
# Copy the production config
sudo cp /var/www/huemixy/nginx-huemixy.conf /etc/nginx/sites-available/huemixy.com

# Test and reload
sudo nginx -t
sudo nginx -s reload
```

## Step 4: Verification and Testing

### Test All Redirect Scenarios

After setup is complete, verify these redirects work correctly:

```bash
# All should redirect to https://www.huemixy.com
curl -I http://huemixy.com
curl -I http://www.huemixy.com
curl -I https://huemixy.com

# This should serve the application
curl -I https://www.huemixy.com
```

### Expected Results

1. `http://huemixy.com` → `https://www.huemixy.com` (301 redirect)
2. `http://www.huemixy.com` → `https://www.huemixy.com` (301 redirect)
3. `https://huemixy.com` → `https://www.huemixy.com` (301 redirect)
4. `https://www.huemixy.com` → Application response (302 to /login)

### SSL Certificate Verification

```bash
# Check certificate details
sudo certbot certificates

# Test SSL configuration
openssl s_client -connect www.huemixy.com:443 -servername www.huemixy.com
```

## Step 5: Automatic Renewal

### Certbot Auto-Renewal

Let's Encrypt certificates expire every 90 days. Certbot automatically sets up renewal:

```bash
# Check renewal status
sudo certbot renew --dry-run

# View renewal timer
sudo systemctl status certbot.timer

# Manual renewal (if needed)
sudo certbot renew
```

## Current Status

### ✅ Completed Tasks

- [x] Application deployed and running on port 3006
- [x] MySQL database `huemixy` created with full schema
- [x] PM2 process configured and running
- [x] Nginx configuration files created
- [x] Temporary HTTP configuration installed
- [x] Application responding correctly (redirects to /login)

### ⏳ Pending Tasks

- [ ] **DNS Configuration** - Point huemixy.com and www.huemixy.com to sabrehawk
- [ ] **SSL Certificate Generation** - Run certbot after DNS propagation
- [ ] **Final Testing** - Verify all redirects and HTTPS functionality

## Troubleshooting

### Common Issues

**Certificate Generation Fails:**
- Verify DNS is pointing to server
- Check that port 80 is accessible from internet
- Ensure nginx is running and configured correctly

**Application Not Loading:**
- Check PM2 status: `pm2 status huemixy`
- Verify port 3006 is responding: `curl http://localhost:3006`
- Check logs: `pm2 logs huemixy`

**Redirect Loops:**
- Verify nginx configuration syntax: `sudo nginx -t`
- Check for conflicting server blocks
- Review proxy headers configuration

### Log Files

- **Nginx Access:** `/var/log/nginx/huemixy.access.log`
- **Nginx Error:** `/var/log/nginx/huemixy.error.log`
- **Certbot:** `/var/log/letsencrypt/letsencrypt.log`
- **Application:** `pm2 logs huemixy`

## Security Considerations

### Production SSL Configuration

The nginx configuration includes:

- **Strong SSL ciphers** and protocols
- **HSTS headers** for enhanced security
- **XSS protection** headers
- **Content type sniffing** prevention
- **Frame options** to prevent clickjacking

### Firewall Configuration

Ensure these ports are open:
- **Port 80** (HTTP) - for SSL verification and redirects
- **Port 443** (HTTPS) - for secure application access
- **Port 3006** - should only be accessible locally

## Next Steps After DNS Configuration

1. **Wait for DNS propagation** (1-24 hours)
2. **Run SSL setup command** from Step 2
3. **Apply final nginx configuration**
4. **Test all domain/redirect scenarios**
5. **Verify SSL certificate and auto-renewal**
6. **Update any hardcoded URLs** in the application if needed

## Support Information

- **Application:** Huemixy Color Study Tool
- **Server:** sabrehawk
- **Port:** 3006 (internal), 80/443 (public)
- **Database:** MySQL `huemixy` on port 3308
- **Process Manager:** PM2 (`huemixy` process)
- **Web Server:** Nginx with Let's Encrypt SSL