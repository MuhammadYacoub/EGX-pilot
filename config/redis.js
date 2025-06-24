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
    logger.warn('⚠️  Redis disabled for development mode');
    return null;
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
    // Redis disabled for development
    logger.info('Redis health check skipped (disabled)');
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