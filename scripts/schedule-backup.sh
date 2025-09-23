#!/bin/bash

# Schedule automated backups using cron
# Usage: ./schedule-backup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup.sh"

echo "Setting up automated backup schedule..."

# Make scripts executable
chmod +x "${BACKUP_SCRIPT}"
chmod +x "${SCRIPT_DIR}/restore.sh"

# Create cron job for daily backups at 2 AM
CRON_JOB="0 2 * * * cd ${SCRIPT_DIR}/.. && ./scripts/backup.sh dev"

# Check if cron job already exists
if ! crontab -l 2>/dev/null | grep -q "backup.sh"; then
    # Add cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo "✅ Daily backup scheduled for 2:00 AM"
else
    echo "ℹ️  Backup schedule already exists"
fi

echo "Current cron jobs:"
crontab -l | grep backup || echo "No backup cron jobs found"