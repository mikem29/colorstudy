# Database Backup & Restore System

Automated MySQL backup and restore system for moving data between environments.

## Quick Start

### Create a Backup
```bash
# Manual backup
npm run backup:dev
# or
./scripts/backup.sh dev

# Environment-specific backups
npm run backup:staging
npm run backup:prod
```

### Restore from Backup
```bash
# Restore specific backup file
./scripts/restore.sh ./backups/dev/colorstudy_dev_20240923_123456.sql.gz

# Restore to different environment
./scripts/restore.sh ./backups/prod/colorstudy_prod_latest.sql.gz staging
```

### Schedule Automatic Backups
```bash
npm run schedule-backup
# Sets up daily backups at 2 AM
```

## File Structure
```
backups/
├── dev/          # Development backups
├── staging/      # Staging backups
└── prod/         # Production backups

scripts/
├── backup.sh     # Create backups
├── restore.sh    # Restore from backup
└── schedule-backup.sh  # Setup cron jobs
```

## Features
- ✅ Environment-specific backups (dev/staging/prod)
- ✅ Automatic compression (gzip)
- ✅ Keeps last 10 backups per environment
- ✅ Timestamped backup files
- ✅ Safe restore with confirmation
- ✅ Automated scheduling via cron

## Backup Files
Backups are saved as: `colorstudy_{environment}_{timestamp}.sql.gz`

Example: `colorstudy_dev_20240923_143022.sql.gz`