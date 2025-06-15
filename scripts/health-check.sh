#!/bin/bash

# EGXpilot Health Check and Monitoring Script
# Server: 41.38.217.73 | Domain: egxpilot.com

set -e

# Configuration
APP_URL="http://localhost:5000"
DOMAIN="egxpilot.com"
LOG_FILE="/var/log/egxpilot/health-check.log"
ALERT_EMAIL="ya3qoup@gmail.com"
SLACK_WEBHOOK=""  # Add Slack webhook if needed

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
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a $LOG_FILE
}

# Check application health
check_app_health() {
    log "Checking application health..."
    
    if curl -f -s --max-time 10 "$APP_URL/health" > /dev/null; then
        log "✅ Application is healthy"
        return 0
    else
        error "❌ Application health check failed"
        return 1
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    if curl -f -s --max-time 10 "$APP_URL/api/health/database" > /dev/null; then
        log "✅ Database is accessible"
        return 0
    else
        error "❌ Database connection failed"
        return 1
    fi
}

# Check Redis connectivity
check_redis() {
    log "Checking Redis connectivity..."
    
    if redis-cli -a 'curhi6-qEbfid' ping 2>/dev/null | grep -q "PONG"; then
        log "✅ Redis is accessible"
        return 0
    else
        error "❌ Redis connection failed"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ $USAGE -lt 80 ]]; then
        log "✅ Disk usage is normal ($USAGE%)"
        return 0
    elif [[ $USAGE -lt 90 ]]; then
        warning "⚠️ Disk usage is high ($USAGE%)"
        return 1
    else
        error "❌ Disk usage is critical ($USAGE%)"
        return 2
    fi
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [[ $MEMORY_USAGE -lt 80 ]]; then
        log "✅ Memory usage is normal (${MEMORY_USAGE}%)"
        return 0
    elif [[ $MEMORY_USAGE -lt 90 ]]; then
        warning "⚠️ Memory usage is high (${MEMORY_USAGE}%)"
        return 1
    else
        error "❌ Memory usage is critical (${MEMORY_USAGE}%)"
        return 2
    fi
}

# Check CPU usage
check_cpu() {
    log "Checking CPU usage..."
    
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    
    if [[ ${CPU_USAGE%.*} -lt 80 ]]; then
        log "✅ CPU usage is normal (${CPU_USAGE}%)"
        return 0
    elif [[ ${CPU_USAGE%.*} -lt 90 ]]; then
        warning "⚠️ CPU usage is high (${CPU_USAGE}%)"
        return 1
    else
        error "❌ CPU usage is critical (${CPU_USAGE}%)"
        return 2
    fi
}

# Check service status
check_services() {
    log "Checking service status..."
    
    SERVICES=("egxpilot" "nginx" "redis-server")
    FAILED_SERVICES=()
    
    for service in "${SERVICES[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log "✅ $service is running"
        else
            error "❌ $service is not running"
            FAILED_SERVICES+=("$service")
        fi
    done
    
    if [[ ${#FAILED_SERVICES[@]} -eq 0 ]]; then
        return 0
    else
        return 1
    fi
}

# Check SSL certificate
check_ssl() {
    log "Checking SSL certificate..."
    
    if command -v openssl &> /dev/null; then
        EXPIRY_DATE=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
        EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_TIMESTAMP - $CURRENT_TIMESTAMP) / 86400 ))
        
        if [[ $DAYS_UNTIL_EXPIRY -gt 30 ]]; then
            log "✅ SSL certificate is valid ($DAYS_UNTIL_EXPIRY days remaining)"
            return 0
        elif [[ $DAYS_UNTIL_EXPIRY -gt 7 ]]; then
            warning "⚠️ SSL certificate expires soon ($DAYS_UNTIL_EXPIRY days)"
            return 1
        else
            error "❌ SSL certificate expires very soon ($DAYS_UNTIL_EXPIRY days)"
            return 2
        fi
    else
        warning "OpenSSL not available, skipping SSL check"
        return 0
    fi
}

# Check external connectivity
check_external() {
    log "Checking external connectivity..."
    
    if curl -f -s --max-time 10 "https://api.github.com" > /dev/null; then
        log "✅ External connectivity is working"
        return 0
    else
        error "❌ External connectivity failed"
        return 1
    fi
}

# Send alert notification
send_alert() {
    local message="$1"
    local severity="$2"
    
    log "Sending alert notification: $message"
    
    # Email notification
    if command -v mail &> /dev/null && [[ -n "$ALERT_EMAIL" ]]; then
        echo "EGXpilot Alert - $severity

Server: 41.38.217.73
Domain: $DOMAIN
Time: $(date)

$message

Please check the system immediately.

---
EGXpilot Monitoring System" | mail -s "EGXpilot Alert - $severity" "$ALERT_EMAIL"
    fi
    
    # Slack notification (if configured)
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 EGXpilot Alert - $severity\n$message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Auto-restart failed services
auto_restart() {
    log "Attempting to restart failed services..."
    
    SERVICES=("egxpilot" "nginx" "redis-server")
    
    for service in "${SERVICES[@]}"; do
        if ! systemctl is-active --quiet "$service"; then
            log "Restarting $service..."
            systemctl restart "$service" && log "✅ $service restarted successfully" || error "❌ Failed to restart $service"
        fi
    done
}

# Main monitoring function
main() {
    log "Starting EGXpilot health check..."
    
    FAILED_CHECKS=()
    
    # Run all checks
    check_app_health || FAILED_CHECKS+=("Application Health")
    check_database || FAILED_CHECKS+=("Database")
    check_redis || FAILED_CHECKS+=("Redis")
    check_services || FAILED_CHECKS+=("Services")
    check_disk_space || FAILED_CHECKS+=("Disk Space")
    check_memory || FAILED_CHECKS+=("Memory")
    check_cpu || FAILED_CHECKS+=("CPU")
    check_ssl || FAILED_CHECKS+=("SSL Certificate")
    check_external || FAILED_CHECKS+=("External Connectivity")
    
    # Report results
    if [[ ${#FAILED_CHECKS[@]} -eq 0 ]]; then
        log "✅ All health checks passed"
        exit 0
    else
        error "❌ Failed checks: ${FAILED_CHECKS[*]}"
        
        # Attempt auto-restart for critical services
        if [[ " ${FAILED_CHECKS[*]} " =~ " Services " ]] || [[ " ${FAILED_CHECKS[*]} " =~ " Application Health " ]]; then
            auto_restart
            
            # Re-check after restart
            sleep 10
            if check_app_health && check_services; then
                log "✅ Services recovered after restart"
                send_alert "EGXpilot services were restarted successfully after failure" "WARNING"
            else
                send_alert "EGXpilot critical failure - services could not be recovered" "CRITICAL"
            fi
        else
            send_alert "EGXpilot health check failures: ${FAILED_CHECKS[*]}" "WARNING"
        fi
        
        exit 1
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main "$@"
