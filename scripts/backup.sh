#!/bin/bash

# Automated MySQL backup script for colorstudy app
# Usage: ./backup.sh [environment]

ENVIRONMENT=${1:-dev}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/${ENVIRONMENT}"
BACKUP_FILE="${BACKUP_DIR}/colorstudy_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Creating backup for ${ENVIRONMENT} environment..."
echo "Backup file: ${BACKUP_FILE}"

# Create MySQL dump using Docker
docker exec colorstudy_mysql mysqldump \
    -u root \
    -prootpassword \
    --single-transaction \
    --routines \
    --triggers \
    colorstudy > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"

    # Compress the backup
    gzip "${BACKUP_FILE}"
    echo "✅ Backup compressed: ${BACKUP_FILE}.gz"

    # Keep only last 10 backups
    cd "${BACKUP_DIR}"
    ls -t colorstudy_${ENVIRONMENT}_*.sql.gz | tail -n +11 | xargs rm -f 2>/dev/null
    echo "✅ Old backups cleaned up (keeping last 10)"

else
    echo "❌ Backup failed!"
    exit 1
fi