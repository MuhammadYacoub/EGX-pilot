# EGXpilot Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build frontend (if exists)
RUN if [ -d "frontend" ]; then \
    cd frontend && \
    npm ci && \
    npm run build; \
  fi

# Production stage
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S egxpilot -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=egxpilot:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=egxpilot:nodejs /app/backend ./backend
COPY --from=builder --chown=egxpilot:nodejs /app/config ./config
COPY --from=builder --chown=egxpilot:nodejs /app/database ./database
COPY --from=builder --chown=egxpilot:nodejs /app/scripts ./scripts
COPY --from=builder --chown=egxpilot:nodejs /app/tests ./tests
COPY --from=builder --chown=egxpilot:nodejs /app/package*.json ./
COPY --from=builder --chown=egxpilot:nodejs /app/.env.production ./.env

# Copy frontend build if exists
RUN if [ -d "/app/frontend/build" ]; then \
    mkdir -p ./public && \
    cp -r /app/frontend/build/* ./public/; \
  fi

# Create log directory
RUN mkdir -p /var/log/egxpilot && chown egxpilot:nodejs /var/log/egxpilot

# Expose port
EXPOSE 5000

# Switch to non-root user
USER egxpilot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
