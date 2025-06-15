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
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: 0,
      keyPrefix: 'egxpilot:dev:'
    },
    dataSources: {
      yahoo: {
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
        timeout: 5000
      },
      investing: {
        baseUrl: 'https://api.investing.com/api/',
        timeout: 5000
      }
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: 10,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxLoginAttempts: 5,
      lockoutTime: 15 * 60 * 1000, // 15 minutes
      passwordMinLength: 8,
      passwordRequireSpecial: true
    },
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
      max: parseInt(process.env.API_RATE_LIMIT) || 100,
      standardHeaders: true,
      legacyHeaders: false
    },
    cache: {
      defaultTTL: 300,
      realtimeTTL: parseInt(process.env.CACHE_REALTIME_TTL) || 60,
      technicalTTL: parseInt(process.env.CACHE_TECHNICAL_TTL) || 300,
      historicalTTL: parseInt(process.env.CACHE_HISTORICAL_TTL) || 86400
    },
    opportunityHunter: {
      scanInterval: parseInt(process.env.OH_SCAN_INTERVAL) || 300000,
      maxOpportunities: 50,
      minVolume: 100000
    },
    email: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'dev'
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'EGXpilot-dev',
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
      host: process.env.REDIS_HOST || '41.38.217.73',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || 'curhi6-qEbfid',
      db: 0,
      keyPrefix: 'egxpilot:prod:'
    },
    dataSources: {
      yahoo: {
        baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart/',
        timeout: 10000
      },
      investing: {
        baseUrl: 'https://api.investing.com/api/',
        timeout: 10000
      }
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: 12,
      sessionTimeout: 24 * 60 * 60 * 1000,
      maxLoginAttempts: 3,
      lockoutTime: 30 * 60 * 1000, // 30 minutes
      passwordMinLength: 10,
      passwordRequireSpecial: true
    },
    rateLimit: {
      windowMs: parseInt(process.env.API_RATE_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
      max: parseInt(process.env.API_RATE_LIMIT) || 500,
      standardHeaders: true,
      legacyHeaders: false
    },
    cache: {
      defaultTTL: 180,
      realtimeTTL: parseInt(process.env.CACHE_REALTIME_TTL) || 30,
      technicalTTL: parseInt(process.env.CACHE_TECHNICAL_TTL) || 180,
      historicalTTL: parseInt(process.env.CACHE_HISTORICAL_TTL) || 43200
    },
    opportunityHunter: {
      scanInterval: parseInt(process.env.OH_SCAN_INTERVAL) || 180000,
      maxOpportunities: parseInt(process.env.OH_MAX_OPPORTUNITIES) || 100,
      minVolume: parseInt(process.env.OH_MIN_VOLUME) || 1000000
    },
    email: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'ya3qoup@gmail.com',
        pass: process.env.SMTP_PASS || 'curhi6-qEbfid'
      }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'warn',
      format: 'combined',
      file: process.env.LOG_FILE || '/var/log/egxpilot/app.log'
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'egxpilot.com',
      audience: process.env.JWT_AUDIENCE || 'egxpilot-users'
    },
    server: {
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT) || 5000,
      domain: process.env.DOMAIN || 'egxpilot.com',
      ip: process.env.SERVER_IP || '41.38.217.73'
    },
    security: {
      cors: {
        origin: process.env.CORS_ORIGIN || 'https://egxpilot.com',
        credentials: true
      },
      helmet: {
        contentSecurityPolicy: process.env.HELMET_CSP_ENABLED === 'true'
      }
    },
    ssl: {
      cert: process.env.SSL_CERT_PATH,
      key: process.env.SSL_KEY_PATH
    }
  },

  test: {
    database: {
      server: 'localhost',
      port: 1433,
      database: 'egxpilot_test',
      user: 'sa',
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectionTimeout: 30000,
        requestTimeout: 30000
      },
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000
      }
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: '',
      db: 15,
      keyPrefix: 'egxpilot:test:'
    },
    auth: {
      jwtSecret: 'test-secret-key',
      jwtExpiresIn: '1h',
      bcryptRounds: 4
    }
  }
};

const environment = process.env.NODE_ENV || 'development';

module.exports = config[environment];
