# Production Environment

## Server Access
- Host: `sabrehawk` (configured in ~/.ssh/config)
- Path: `/var/www/huemixy`
- URL: https://huemixy.com
- Port: 3006

## Database (Production)
- Host: localhost (on sabrehawk)
- Port: 3307
- User: story_user
- Database: huemixy

## Deployment
Run `./deploy.sh` from svelte-app directory to build locally and deploy to production.

## Coupon System
- Flexible promotion system supporting multiple types
- Current types: `upgrade_pro`, `discount_percentage`, `discount_fixed`, `trial_extension`
- Tables: `coupons` (codes/config), `coupon_redemptions` (tracking)
- Manage coupons via phpMyAdmin on production server
- Coupon inputs on: signup, profile, /upgrade pages
- Example: Create code "VAL30" with max_uses=30, type='upgrade_pro' for free Pro upgrades
