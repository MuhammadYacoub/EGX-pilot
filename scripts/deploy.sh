#!/bin/bash

# EGXpilot Production Deployment Script
# Server: 41.38.217.73 | Domain: egxpilot.com

set -e

echo "🚀 EGXpilot Production Deployment Started..."
echo "================================================"

# Configuration
SERVER_IP="41.38.217.73"
DOMAIN="egxpilot.com"
APP_DIR="/var/www/egxpilot"
BACKUP_DIR="/var/backups/egxpilot"
LOG_FILE="/var/log/egxpilot/deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a dedicated user."
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        error "Node.js version 18+ required. Current: $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    # Check disk space
    AVAILABLE_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $AVAILABLE_SPACE -lt 5 ]]; then
        error "Insufficient disk space. At least 5GB required."
    fi
    
    # Check if ports are available
    if netstat -tuln | grep -q ":5000 "; then
        warning "Port 5000 is already in use"
    fi
    
    log "✅ Pre-deployment checks passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    if [[ -d "$APP_DIR" ]]; then
        BACKUP_NAME="egxpilot-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Create application backup
        tar -czf "$BACKUP_DIR/$BACKUP_NAME-app.tar.gz" -C "$APP_DIR" . || warning "Failed to backup application files"
        
        # Backup database
        if command -v sqlcmd &> /dev/null; then
            sqlcmd -S sqlserver -U ya3qoup -P 'curhi6-qEbfid' -Q "BACKUP DATABASE egxpilot TO DISK = '$BACKUP_DIR/$BACKUP_NAME-db.bak'" || warning "Failed to backup database"
        fi
        
        log "✅ Backup completed: $BACKUP_NAME"
    else
        log "No existing deployment to backup"
    fi
}

# Setup directories and permissions
setup_directories() {
    log "Setting up directories..."
    
    # Create application directories
    mkdir -p "$APP_DIR"
    mkdir -p /var/log/egxpilot
    mkdir -p /var/run/egxpilot
    mkdir -p "$BACKUP_DIR"
    
    # Set permissions
    chmod 755 "$APP_DIR"
    chmod 755 /var/log/egxpilot
    chmod 755 /var/run/egxpilot
    
    log "✅ Directories setup completed"
}

# Install dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package manager
    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y nginx redis-server curl wget unzip
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y nginx redis curl wget unzip
    fi
    
    log "✅ System dependencies installed"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Copy application files
    if [[ -f "package.json" ]]; then
        # Install Node.js dependencies
        log "Installing Node.js dependencies..."
        npm ci --production --silent
        
        # Copy files to deployment directory
        rsync -av --exclude='node_modules' --exclude='.git' --exclude='logs' . "$APP_DIR/"
        
        # Install dependencies in deployment directory
        cd "$APP_DIR"
        npm ci --production --silent
        
        # Copy environment file
        cp .env.production .env
        
        log "✅ Application deployed successfully"
    else
        error "package.json not found. Are you in the correct directory?"
    fi
}

# Setup database
setup_database() {
    log "Setting up database..."
    
    cd "$APP_DIR"
    
    # Initialize database
    if node scripts/init-database.js; then
        log "✅ Database initialized successfully"
    else
        warning "Database initialization failed or already exists"
    fi
    
    # Run migrations
    if [[ -f "scripts/run-migrations.js" ]]; then
        node scripts/run-migrations.js || warning "Migrations failed"
    fi
    
    # Seed data
    if [[ -f "database/seeds/run-seeds.js" ]]; then
        node database/seeds/run-seeds.js || warning "Seeding failed"
    fi
}

# Configure services
configure_services() {
    log "Configuring services..."
    
    # Create systemd service file
    cat > /etc/systemd/system/egxpilot.service << EOF
[Unit]
Description=EGXpilot Smart Financial Advisor
After=network.target

[Service]
Type=simple
User=ya3qoup
Group=ya3qoup
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=5000
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=egxpilot

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    systemctl daemon-reload
    systemctl enable egxpilot
    
    # Configure Nginx
    if [[ -f "nginx/nginx.conf" ]]; then
        cp nginx/nginx.conf /etc/nginx/nginx.conf
        nginx -t || error "Nginx configuration test failed"
    fi
    
    # Configure Redis
    if [[ -f "/etc/redis/redis.conf" ]]; then
        sed -i 's/# requirepass foobared/requirepass curhi6-qEbfid/' /etc/redis/redis.conf
        systemctl enable redis-server
    fi
    
    log "✅ Services configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start Redis
    systemctl start redis-server || error "Failed to start Redis"
    
    # Start application
    systemctl start egxpilot || error "Failed to start EGXpilot"
    
    # Start Nginx
    systemctl start nginx || error "Failed to start Nginx"
    
    log "✅ All services started"
}

# Health check
health_check() {
    log "Running health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check application health
    if curl -f -s "http://localhost:5000/health" > /dev/null; then
        log "✅ Application health check passed"
    else
        error "Application health check failed"
    fi
    
    # Check Redis
    if redis-cli -a 'curhi6-qEbfid' ping | grep -q "PONG"; then
        log "✅ Redis health check passed"
    else
        error "Redis health check failed"
    fi
    
    # Check Nginx
    if nginx -t; then
        log "✅ Nginx configuration is valid"
    else
        error "Nginx configuration is invalid"
    fi
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Set up log rotation
    cat > /etc/logrotate.d/egxpilot << EOF
/var/log/egxpilot/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 ya3qoup ya3qoup
    postrotate
        systemctl reload egxpilot > /dev/null 2>&1 || true
    endscript
}
EOF

    # Set up monitoring cron job
    (crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:5000/health || systemctl restart egxpilot") | crontab -
    
    # Set up backup cron job
    (crontab -l 2>/dev/null; echo "0 2 * * * /var/www/egxpilot/scripts/backup.sh") | crontab -
    
    log "✅ Post-deployment tasks completed"
}

# Main deployment function
main() {
    log "Starting EGXpilot production deployment"
    log "Server: $SERVER_IP | Domain: $DOMAIN"
    
    check_root
    pre_deployment_checks
    backup_current
    setup_directories
    install_dependencies
    deploy_application
    setup_database
    configure_services
    start_services
    health_check
    post_deployment
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "================================================"
    echo "Application URL: https://$DOMAIN"
    echo "Health Check: https://$DOMAIN/health"
    echo "Logs: /var/log/egxpilot/"
    echo "Service Status: systemctl status egxpilot"
    echo ""
    log "✅ EGXpilot deployment completed successfully"
}

# Run main function
main "$@"
