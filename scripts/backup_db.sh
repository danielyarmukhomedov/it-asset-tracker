#!/usr/bin/env bash
set -euo pipefail

# Строгая маска прав: файл сможет прочитать только владелец (root/postgres)
umask 077

BACKUP_DIR="/var/backups/archive-postgres"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/asset_tracker_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting PostgreSQL 18 backup for asset_tracker..."

# Снятие полного сжатого дампа от системного пользователя postgres
sudo -u postgres pg_dump -d asset_tracker | gzip -9 > "${BACKUP_FILE}"

# Проверка, что архив не пустой и целостный
if [ -s "${BACKUP_FILE}" ]; then
    gzip -t "${BACKUP_FILE}"
    echo "[$(date)] SUCCESS: Backup verified and saved to ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
else
    echo "[$(date)] ERROR: Backup file is empty!" >&2
    exit 1
fi

# Ротация: удаляем архивы старше 7 дней
find "${BACKUP_DIR}" -type f -name "asset_tracker_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Retention policy applied (> ${RETENTION_DAYS} days cleaned)."
