// Development Environment Configuration
module.exports = {
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
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: 10
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'EGXpilot-dev',
    audience: 'EGXpilot-users'
  },
  server: {
    port: parseInt(process.env.PORT) || 5000,
    host: '0.0.0.0'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'dev'
  }
};
