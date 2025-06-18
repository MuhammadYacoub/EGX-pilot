// Redis Configuration and Connection
const redis = require('redis');
const config = require('./environment');
const logger = require('../backend/utils/logger');

let redisClient;

/**
 * Connect to Redis
 */
async function connectRedis() {
  try {
    if (!redisClient) {
      redisClient = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      redisClient.on('error', (err) => {
        logger.error('Redis connection error:', err);
      });

      redisClient.on('connect', () => {
        logger.info('✅ Connected to Redis');
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis is ready');
      });

      await redisClient.connect();
    }
    
    return redisClient;
  } catch (error) {
    logger.warn('⚠️  Redis connection failed (optional service):', error.message);
    // Return null if Redis is optional
    return null;
  }
}

/**
 * Get Redis client
 */
function getRedisClient() {
  return redisClient;
}

/**
 * Test Redis connection
 */
async function testRedisConnection() {
  try {
    if (!redisClient) {
      await connectRedis();
    }
    
    if (redisClient) {
      await redisClient.ping();
      return true;
    }
    
    return false;
  } catch (error) {
    logger.warn('Redis health check failed:', error.message);
    return false;
  }
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
      logger.info('✅ Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  testRedisConnection,
  closeRedis
};