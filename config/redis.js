const redis = require('redis');
const config = require('./environment');
const logger = require('../backend/utils/logger');

let redisClient;

/**
 * Connect to Redis
 * @returns {Promise<redis.RedisClient>}
 */
async function connectRedis() {
  try {
    if (!config.redis.enabled || !config.redis.host) {
      logger.info('Redis disabled - continuing without cache');
      return null;
    }
    
    if (!redisClient) {
      redisClient = redis.createClient({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 3
      });
      
      redisClient.on('error', (err) => {
        logger.error('Redis error:', err);
      });
      
      redisClient.on('connect', () => {
        logger.info('✅ Connected to Redis');
      });
      
      redisClient.on('reconnecting', () => {
        logger.info('🔄 Reconnecting to Redis...');
      });
      
      await redisClient.connect();
    }
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
}

/**
 * Get Redis client instance
 * @returns {redis.RedisClient}
 */
function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

/**
 * Test Redis connection
 * @returns {Promise<boolean>}
 */
async function testRedisConnection() {
  try {
    const client = await getRedis();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error('Redis test connection failed:', error);
    throw error;
  }
}

/**
 * Cache manager with TTL support
 */
class CacheManager {
  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 300) {
    try {
      const client = getRedisClient();
      const serializedValue = JSON.stringify(value);
      
      if (ttl > 0) {
        await client.setEx(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
    } catch (error) {
      logger.error('Cache set error:', { key, error: error.message });
      // Don't throw error - cache failures shouldn't break the app
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      
      if (value) {
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      logger.error('Cache get error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', { key, error: error.message });
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   */
  async mset(keyValuePairs, ttl = 300) {
    try {
      const client = getRedisClient();
      const pipeline = client.multi();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const serializedValue = JSON.stringify(value);
        if (ttl > 0) {
          pipeline.setEx(key, ttl, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      });
      
      await pipeline.exec();
    } catch (error) {
      logger.error('Cache mset error:', { error: error.message });
    }
  }

  /**
   * Get multiple values from cache
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>}
   */
  async mget(keys) {
    try {
      const client = getRedisClient();
      const values = await client.mGet(keys);
      
      const result = {};
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        } else {
          result[key] = null;
        }
      });
      
      return result;
    } catch (error) {
      logger.error('Cache mget error:', { keys, error: error.message });
      return {};
    }
  }

  /**
   * Increment a numeric value in cache
   * @param {string} key - Cache key
   * @param {number} increment - Value to increment by (default: 1)
   * @returns {Promise<number>}
   */
  async incr(key, increment = 1) {
    try {
      const client = getRedisClient();
      return await client.incrBy(key, increment);
    } catch (error) {
      logger.error('Cache increment error:', { key, increment, error: error.message });
      return 0;
    }
  }

  /**
   * Set expiration time for a key
   * @param {string} key - Cache key
   * @param {number} seconds - Expiration time in seconds
   */
  async expire(key, seconds) {
    try {
      const client = getRedisClient();
      await client.expire(key, seconds);
    } catch (error) {
      logger.error('Cache expire error:', { key, seconds, error: error.message });
    }
  }

  /**
   * Clear all cache entries with a pattern
   * @param {string} pattern - Key pattern (e.g., "user:*")
   */
  async clearPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
        logger.info(`Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Cache clear pattern error:', { pattern, error: error.message });
    }
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
      logger.info('Redis connection closed');
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);

// Create cache manager instance
const cache = new CacheManager();

module.exports = {
  connectRedis,
  getRedisClient,
  closeRedis,
  cache,
  CacheManager,
  testRedisConnection
};
