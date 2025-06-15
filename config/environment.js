require('dotenv').config();

const config = {
  development: {
    database: {
      server: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_NAME || 'egxpilot_dev',
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    },
    redis: {
      host: process.env.REDIS_HOST || null,
      port: parseInt(process.env.REDIS_PORT) || null,
      password: process.env.REDIS_PASSWORD || '',
      db: 0,
      keyPrefix: 'egxpilot:dev:',
      enabled: !!process.env.REDIS_HOST
    },
    dataSources: {
      yahoo: {
        enabled: true,
        priority: 1,
        rateLimit: 100, // requests per minute
        timeout: 10000
      },
      investing: {
        enabled: true,
        priority: 2,
        rateLimit: 60,
        timeout: 15000
      },
      egx: {
        enabled: true,
        priority: 3,
        rateLimit: 30,
        timeout: 20000
      }
    },
    cache: {
      realTimeData: { ttl: 60 },         // 1 minute for live prices
      technicalAnalysis: { ttl: 300 },   // 5 minutes for TA results
      historicalData: { ttl: 86400 },    // 24 hours for historical data
      newsData: { ttl: 1800 },           // 30 minutes for news
      opportunityScans: { ttl: 300 }     // 5 minutes for opportunity scans
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'egxpilot-development-secret-key-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'EGXpilot',
      audience: 'EGXpilot-users'
    }
  },

  production: {
    database: {
      server: process.env.DB_HOST || 'sqlserver',
      port: parseInt(process.env.DB_PORT) || 1433,
      database: process.env.DB_NAME || 'egxpilot',
      user: process.env.DB_USER || 'ya3qoup',
      password: process.env.DB_PASSWORD || 'curhi6-qEbfid',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
      },
      pool: {
        max: 20,
        min: 5,
        idleTimeoutMillis: 30000
      }
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      keyPrefix: 'egxpilot:prod:'
    },
    dataSources: {
      yahoo: {
        enabled: true,
        priority: 1,
        rateLimit: 200,
        timeout: 8000
      },
      investing: {
        enabled: true,
        priority: 2,
        rateLimit: 120,
        timeout: 10000
      },
      egx: {
        enabled: true,
        priority: 3,
        rateLimit: 60,
        timeout: 15000
      }
    },
    cache: {
      realTimeData: { ttl: 30 },         // 30 seconds for live prices
      technicalAnalysis: { ttl: 180 },   // 3 minutes for TA results
      historicalData: { ttl: 43200 },    // 12 hours for historical data
      newsData: { ttl: 900 },            // 15 minutes for news
      opportunityScans: { ttl: 180 }     // 3 minutes for opportunity scans
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'EGXpilot',
      audience: 'EGXpilot-users'
    }
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];
