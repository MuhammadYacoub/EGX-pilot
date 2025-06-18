#!/bin/bash

# EGXpilot Quick Start Script
# Run this script to quickly set up and start the EGXpilot system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ya3qoup/projects/production/EGXpilot"
LOG_FILE="$PROJECT_DIR/quick-start.log"

# Create log file
touch "$LOG_FILE"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                         EGXpilot                              ║
║            Smart Financial Advisor for EGX                   ║
║                     Quick Start Script                       ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    error "Not in EGXpilot directory. Please run this script from the project root."
fi

# Function to check if a service is running
check_service() {
    local service_name="$1"
    local port="$2"
    
    if netstat -tuln | grep -q ":$port "; then
        log "✅ $service_name is running on port $port"
        return 0
    else
        warning "❌ $service_name is not running on port $port"
        return 1
    fi
}

# Function to start a service if not running
start_service() {
    local service_name="$1"
    local command="$2"
    local port="$3"
    
    if ! check_service "$service_name" "$port"; then
        info "Starting $service_name..."
        eval "$command" &
        sleep 3
        
        if check_service "$service_name" "$port"; then
            log "✅ $service_name started successfully"
        else
            error "❌ Failed to start $service_name"
        fi
    fi
}

# Main function
main() {
    log "Starting EGXpilot Quick Setup..."
    
    # Step 1: Check Node.js
    info "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js 18+ first."
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        error "Node.js version 18+ required. Current: $(node --version)"
    fi
    log "✅ Node.js $(node --version) detected"
    
    # Step 2: Install dependencies
    info "Installing Node.js dependencies..."
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        npm install || error "Failed to install dependencies"
        log "✅ Dependencies installed"
    else
        log "✅ Dependencies already installed"
    fi
    
    # Step 3: Check environment file
    info "Checking environment configuration..."
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.production" ]]; then
            cp .env.production .env
            log "✅ Copied production environment file"
        else
            warning "No .env file found. Creating from template..."
            cat > .env << 'EOF'
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=1433
DB_NAME=egxpilot_dev
DB_USER=sa
DB_PASSWORD=curhi6-qEbfid
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=curhi6-qEbfid
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
EOF
            warning "Please update .env file with your database credentials"
        fi
    else
        log "✅ Environment file exists"
    fi
    
    # Step 4: Check Redis (optional for development)
    info "Checking Redis service..."
    if command -v redis-server &> /dev/null; then
        if ! check_service "Redis" "6379"; then
            info "Starting Redis server..."
            redis-server --daemonize yes --requirepass curhi6-qEbfid || warning "Could not start Redis"
        fi
    else
        warning "Redis not installed. Install Redis for better performance."
    fi
    
    # Step 5: Database setup
    info "Setting up database..."
    if node scripts/init-database.js 2>/dev/null; then
        log "✅ Database initialized successfully"
    else
        warning "Database initialization failed or already exists"
    fi
    
    # Step 6: Start the application
    info "Starting EGXpilot application..."
    
    # Check if already running
    if check_service "EGXpilot" "5000"; then
        log "✅ EGXpilot is already running"
    else
        info "Starting EGXpilot server..."
        
        # Start in background
        nohup npm start > egxpilot.log 2>&1 &
        EGXPILOT_PID=$!
        
        # Wait for startup
        sleep 5
        
        # Check if started successfully
        if check_service "EGXpilot" "5000"; then
            log "✅ EGXpilot started successfully (PID: $EGXPILOT_PID)"
            echo "$EGXPILOT_PID" > egxpilot.pid
        else
            error "❌ Failed to start EGXpilot. Check egxpilot.log for details."
        fi
    fi
    
    # Step 7: Health check
    info "Running health check..."
    sleep 2
    
    if curl -f -s "http://localhost:5000/health" > /dev/null; then
        log "✅ Health check passed"
    else
        error "❌ Health check failed"
    fi
    
    # Step 8: Display information
    echo ""
    echo -e "${GREEN}🎉 EGXpilot is now running!${NC}"
    echo ""
    echo -e "${BLUE}📊 Access Information:${NC}"
    echo "• Application: http://localhost:5000"
    echo "• Health Check: http://localhost:5000/health"
    echo "• API Documentation: http://localhost:5000/api"
    echo "• Logs: tail -f egxpilot.log"
    echo ""
    echo -e "${BLUE}🔧 Management Commands:${NC}"
    echo "• Stop: kill \$(cat egxpilot.pid) (or Ctrl+C if running in foreground)"
    echo "• Restart: npm run dev"
    echo "• Health Check: curl http://localhost:5000/health"
    echo "• View Logs: tail -f egxpilot.log"
    echo ""
    echo -e "${YELLOW}📚 Next Steps:${NC}"
    echo "1. Test API endpoints with Postman or curl"
    echo "2. Register a new user: POST /api/auth/register"
    echo "3. Get stock data: GET /api/stocks"
    echo "4. Run opportunity scan: POST /api/opportunities/scan"
    echo "5. Check the full documentation in README.md"
    echo ""
    
    log "✅ EGXpilot Quick Start completed successfully!"
}

# Function to stop EGXpilot
stop_egxpilot() {
    info "Stopping EGXpilot..."
    
    if [[ -f "egxpilot.pid" ]]; then
        PID=$(cat egxpilot.pid)
        if kill "$PID" 2>/dev/null; then
            log "✅ EGXpilot stopped (PID: $PID)"
            rm -f egxpilot.pid
        else
            warning "Process $PID not found or already stopped"
        fi
    else
        # Try to find and kill the process
        PIDS=$(pgrep -f "node.*server.js" || true)
        if [[ -n "$PIDS" ]]; then
            echo "$PIDS" | xargs kill
            log "✅ EGXpilot processes stopped"
        else
            warning "No EGXpilot processes found"
        fi
    fi
}

# Function to restart EGXpilot
restart_egxpilot() {
    info "Restarting EGXpilot..."
    stop_egxpilot
    sleep 2
    main
}

# Function to show status
show_status() {
    echo -e "${BLUE}EGXpilot Status:${NC}"
    echo ""
    
    # Check services
    echo "Services:"
    check_service "EGXpilot" "5000" && echo "  ✅ Application: Running" || echo "  ❌ Application: Stopped"
    check_service "Redis" "6379" && echo "  ✅ Redis: Running" || echo "  ❌ Redis: Stopped"
    
    echo ""
    echo "Files:"
    [[ -f ".env" ]] && echo "  ✅ Environment: Configured" || echo "  ❌ Environment: Missing"
    [[ -d "node_modules" ]] && echo "  ✅ Dependencies: Installed" || echo "  ❌ Dependencies: Missing"
    [[ -f "egxpilot.pid" ]] && echo "  ✅ PID file: $(cat egxpilot.pid)" || echo "  ⚠️  PID file: Not found"
    
    echo ""
    echo "Quick Commands:"
    echo "  ./quick-start.sh start    - Start EGXpilot"
    echo "  ./quick-start.sh stop     - Stop EGXpilot"
    echo "  ./quick-start.sh restart  - Restart EGXpilot"
    echo "  ./quick-start.sh status   - Show this status"
}

# Command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        stop_egxpilot
        ;;
    "restart")
        restart_egxpilot
        ;;
    "status")
        show_status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start EGXpilot (default)"
        echo "  stop    - Stop EGXpilot"
        echo "  restart - Restart EGXpilot"
        echo "  status  - Show status"
        exit 1
        ;;
esac
