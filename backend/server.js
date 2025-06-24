require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./api/routes/auth');
const stocksRoutes = require('./api/routes/stocks');
const analysisRoutes = require('./api/routes/analysis');
const portfoliosRoutes = require('./api/routes/portfolios');
const alertsRoutes = require('./api/routes/alerts');
// const backtestRoutes = require('./api/routes/backtest');
const opportunitiesRoutes = require('./api/routes/opportunities');

// Import middleware
const { authenticate, optionalAuth } = require('./middleware/auth');
const validationMiddleware = require('./api/middleware/validation');

// Import services
const logger = require('./utils/logger');
const { connectDatabase } = require('../config/database');
const { connectRedis } = require('../config/redis');
const opportunityHunter = require('./services/opportunityHunter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/portfolios', portfoliosRoutes);
app.use('/api/alerts', alertsRoutes);
// app.use('/api/backtest', backtestRoutes);
app.use('/api/opportunities', opportunitiesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      server: {
        ip: process.env.SERVER_IP || 'localhost',
        domain: process.env.DOMAIN || 'localhost'
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Detailed health check with dependencies
app.get('/health/detailed', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    services: {}
  };

  try {
    // Check database connection
    try {
      const { testConnection } = require('../config/database');
      await testConnection();
      checks.services.database = { status: 'healthy', message: 'Connected' };
    } catch (error) {
      checks.services.database = { status: 'unhealthy', message: error.message };
      checks.status = 'unhealthy';
    }

    // Check Redis connection (optional)
    try {
      const { testRedisConnection } = require('../config/redis');
      const redisConnected = await testRedisConnection();
      if (redisConnected) {
        checks.services.redis = { status: 'healthy', message: 'Connected' };
      } else {
        checks.services.redis = { status: 'optional', message: 'Not available (optional service)' };
      }
    } catch (error) {
      checks.services.redis = { status: 'optional', message: 'Not available (optional service)' };
      // Don't mark overall system as unhealthy for Redis
    }

    // System metrics
    checks.system = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    };

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Metrics endpoint for monitoring
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    server: {
      uptime_seconds: process.uptime(),
      memory_usage_bytes: process.memoryUsage(),
      cpu_usage: process.cpuUsage(),
      version: process.version,
      platform: process.platform
    },
    application: {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.status(200).json(metrics);
});

// Status endpoint
app.get('/status', (req, res) => {
  res.status(200).json({
    service: 'EGXpilot',
    status: 'online',
    timestamp: new Date().toISOString(),
    server: process.env.SERVER_IP || 'localhost',
    domain: process.env.DOMAIN || 'localhost'
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  socket.on('subscribe-stock', (symbol) => {
    socket.join(`stock-${symbol}`);
    logger.info(`User ${socket.id} subscribed to ${symbol}`);
  });
  
  socket.on('unsubscribe-stock', (symbol) => {
    socket.leave(`stock-${symbol}`);
    logger.info(`User ${socket.id} unsubscribed from ${symbol}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and services
async function initialize() {
  try {
    // Connect to databases
    await connectDatabase();
    
    // Try to connect to Redis (optional)
    try {
      await connectRedis();
      logger.info('✅ Redis connected');
    } catch (error) {
      logger.warn('⚠️  Redis not available, continuing without caching:', error.message);
    }
    
    // Start opportunity hunter (temporarily disabled for development)
    // await opportunityHunter.initialize();
    // opportunityHunter.startScanning();
    logger.info('⚠️  Opportunity Hunter temporarily disabled for development');
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Start server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  initialize().then(() => {
    server.listen(PORT, () => {
      logger.info(`🚀 EGXpilot server running on port ${PORT}`);
      logger.info(`🔗 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, io };
