#!/bin/bash

# Automated MySQL restore script for colorstudy app
# Usage: ./restore.sh <backup_file> [target_environment]

if [ $# -lt 1 ]; then
    echo "Usage: $0 <backup_file> [target_environment]"
    echo "Example: $0 ./backups/dev/colorstudy_dev_20240923_123456.sql.gz staging"
    exit 1
fi

BACKUP_FILE=$1
TARGET_ENV=${2:-dev}

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "❌ Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "Restoring backup to ${TARGET_ENV} environment..."
echo "Backup file: ${BACKUP_FILE}"

# Check if file is compressed
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "📦 Decompressing backup..."
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
    gunzip -c "${BACKUP_FILE}" > "${TEMP_FILE}"
    SQL_FILE="${TEMP_FILE}"
else
    SQL_FILE="${BACKUP_FILE}"
fi

# Confirm before proceeding
echo "⚠️  This will overwrite the current database. Continue? (y/N)"
read -r confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    [ -f "${TEMP_FILE}" ] && rm "${TEMP_FILE}"
    exit 0
fi

# Drop and recreate database
echo "🔄 Recreating database..."
docker exec colorstudy_mysql mysql \
    -u root \
    -prootpassword \
    -e "DROP DATABASE IF EXISTS colorstudy; CREATE DATABASE colorstudy;"

# Restore the backup
echo "📥 Restoring data..."
docker exec -i colorstudy_mysql mysql \
    -u root \
    -prootpassword \
    colorstudy < "${SQL_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi

# Clean up temp file
[ -f "${TEMP_FILE}" ] && rm "${TEMP_FILE}"

echo "🎉 Database restored from: ${BACKUP_FILE}"