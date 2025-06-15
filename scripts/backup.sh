#!/bin/bash

# EGXpilot Production Backup Script
# Server: 41.38.217.73 | Domain: egxpilot.com

set -e

# Configuration
BACKUP_DIR="/var/backups/egxpilot"
APP_DIR="/var/www/egxpilot"
LOG_FILE="/var/log/egxpilot/backup.log"
RETENTION_DAYS=30
DB_NAME="egxpilot"
DB_USER="ya3qoup"
DB_PASS="curhi6-qEbfid"
DB_HOST="sqlserver"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a $LOG_FILE
}

# Create backup directory
create_backup_dir() {
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="egxpilot_backup_$TIMESTAMP"
    CURRENT_BACKUP_DIR="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$CURRENT_BACKUP_DIR"
    log "Created backup directory: $CURRENT_BACKUP_DIR"
}

# Backup application files
backup_application() {
    log "Backing up application files..."
    
    if [[ -d "$APP_DIR" ]]; then
        tar -czf "$CURRENT_BACKUP_DIR/application.tar.gz" -C "$APP_DIR" \
            --exclude='node_modules' \
            --exclude='logs' \
            --exclude='*.log' \
            --exclude='.git' \
            . || error "Failed to backup application files"
        
        log "✅ Application files backed up successfully"
    else
        warning "Application directory not found: $APP_DIR"
    fi
}

# Backup database
backup_database() {
    log "Backing up database..."
    
    if command -v sqlcmd &> /dev/null; then
        # SQL Server backup
        sqlcmd -S "$DB_HOST" -U "$DB_USER" -P "$DB_PASS" -Q \
            "BACKUP DATABASE [$DB_NAME] TO DISK = '$CURRENT_BACKUP_DIR/database.bak' WITH FORMAT, INIT;" \
            || error "Failed to backup database"
        
        log "✅ Database backed up successfully"
    else
        warning "sqlcmd not found. Skipping database backup."
    fi
}

# Backup Redis data
backup_redis() {
    log "Backing up Redis data..."
    
    if command -v redis-cli &> /dev/null; then
        # Create Redis dump
        redis-cli -a 'curhi6-qEbfid' BGSAVE || warning "Redis background save failed"
        
        # Wait for background save to complete
        sleep 5
        
        # Copy dump file
        if [[ -f "/var/lib/redis/dump.rdb" ]]; then
            cp /var/lib/redis/dump.rdb "$CURRENT_BACKUP_DIR/redis_dump.rdb" || warning "Failed to copy Redis dump"
            log "✅ Redis data backed up successfully"
        else
            warning "Redis dump file not found"
        fi
    else
        warning "redis-cli not found. Skipping Redis backup."
    fi
}

# Backup configuration files
backup_config() {
    log "Backing up configuration files..."
    
    CONFIG_BACKUP_DIR="$CURRENT_BACKUP_DIR/config"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # Nginx configuration
    if [[ -f "/etc/nginx/nginx.conf" ]]; then
        cp /etc/nginx/nginx.conf "$CONFIG_BACKUP_DIR/" || warning "Failed to backup nginx.conf"
    fi
    
    # Systemd service file
    if [[ -f "/etc/systemd/system/egxpilot.service" ]]; then
        cp /etc/systemd/system/egxpilot.service "$CONFIG_BACKUP_DIR/" || warning "Failed to backup service file"
    fi
    
    # Environment file
    if [[ -f "$APP_DIR/.env" ]]; then
        cp "$APP_DIR/.env" "$CONFIG_BACKUP_DIR/" || warning "Failed to backup .env file"
    fi
    
    # SSL certificates
    if [[ -d "/etc/nginx/ssl" ]]; then
        cp -r /etc/nginx/ssl "$CONFIG_BACKUP_DIR/" || warning "Failed to backup SSL certificates"
    fi
    
    log "✅ Configuration files backed up successfully"
}

# Backup logs
backup_logs() {
    log "Backing up logs..."
    
    if [[ -d "/var/log/egxpilot" ]]; then
        tar -czf "$CURRENT_BACKUP_DIR/logs.tar.gz" -C "/var/log/egxpilot" . || warning "Failed to backup logs"
        log "✅ Logs backed up successfully"
    else
        warning "Log directory not found"
    fi
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    cat > "$CURRENT_BACKUP_DIR/manifest.txt" << EOF
EGXpilot Backup Manifest
========================
Backup Date: $(date)
Server: 41.38.217.73
Domain: egxpilot.com
Backup Name: $BACKUP_NAME

Files Included:
- application.tar.gz (Application source code)
- database.bak (SQL Server database backup)
- redis_dump.rdb (Redis data dump)
- config/ (Configuration files)
- logs.tar.gz (Application logs)

Database Info:
- Host: $DB_HOST
- Database: $DB_NAME
- User: $DB_USER

Restore Instructions:
1. Extract application.tar.gz to application directory
2. Restore database.bak using SQL Server
3. Copy redis_dump.rdb to Redis data directory
4. Restore configuration files from config/
5. Restart all services

EOF

    # Add file sizes
    echo "" >> "$CURRENT_BACKUP_DIR/manifest.txt"
    echo "File Sizes:" >> "$CURRENT_BACKUP_DIR/manifest.txt"
    ls -lh "$CURRENT_BACKUP_DIR"/ >> "$CURRENT_BACKUP_DIR/manifest.txt"
    
    log "✅ Backup manifest created"
}

# Compress entire backup
compress_backup() {
    log "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"/ || error "Failed to compress backup"
    
    # Remove uncompressed directory
    rm -rf "$BACKUP_NAME"
    
    BACKUP_SIZE=$(du -h "$BACKUP_NAME.tar.gz" | cut -f1)
    log "✅ Backup compressed successfully (Size: $BACKUP_SIZE)"
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -name "egxpilot_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete || warning "Failed to clean old backups"
    
    REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "egxpilot_backup_*.tar.gz" | wc -l)
    log "✅ Cleanup completed. Remaining backups: $REMAINING_BACKUPS"
}

# Send notification (optional)
send_notification() {
    log "Sending backup notification..."
    
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
    
    # Create notification message
    MESSAGE="EGXpilot Backup Completed
Server: 41.38.217.73
Date: $(date)
Backup: $BACKUP_NAME.tar.gz
Size: $BACKUP_SIZE
Location: $BACKUP_DIR"

    # Send email notification (if configured)
    if command -v mail &> /dev/null && [[ -n "$NOTIFICATION_EMAIL" ]]; then
        echo "$MESSAGE" | mail -s "EGXpilot Backup Completed" "$NOTIFICATION_EMAIL" || warning "Failed to send email notification"
    fi
    
    # Log notification
    echo "$MESSAGE" >> "$LOG_FILE"
    log "✅ Notification sent"
}

# Verify backup integrity
verify_backup() {
    log "Verifying backup integrity..."
    
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_NAME.tar.gz"
    
    # Test archive integrity
    if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
        log "✅ Backup archive integrity verified"
    else
        error "Backup archive is corrupted!"
    fi
    
    # Check file size
    BACKUP_SIZE_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    if [[ $BACKUP_SIZE_BYTES -lt 1000000 ]]; then  # Less than 1MB
        warning "Backup file seems too small: $BACKUP_SIZE_BYTES bytes"
    fi
}

# Main backup function
main() {
    log "Starting EGXpilot backup process..."
    
    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"
    
    # Check disk space
    AVAILABLE_SPACE=$(df -BG "$BACKUP_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $AVAILABLE_SPACE -lt 2 ]]; then
        error "Insufficient disk space for backup. At least 2GB required."
    fi
    
    create_backup_dir
    backup_application
    backup_database
    backup_redis
    backup_config
    backup_logs
    create_manifest
    compress_backup
    verify_backup
    cleanup_old_backups
    send_notification
    
    log "✅ EGXpilot backup completed successfully: $BACKUP_NAME.tar.gz"
}

# Run main function
main "$@"
