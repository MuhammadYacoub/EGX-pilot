// Production Environment Configuration
module.exports = {
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
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: 12
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'egxpilot.com',
    audience: process.env.JWT_AUDIENCE || 'egxpilot-users'
  },
  server: {
    port: parseInt(process.env.PORT) || 5000,
    host: '0.0.0.0',
    domain: process.env.DOMAIN || 'egxpilot.com',
    ip: process.env.SERVER_IP || '41.38.217.73'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'warn',
    format: 'combined',
    file: process.env.LOG_FILE || '/var/log/egxpilot/app.log'
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://egxpilot.com',
      credentials: true
    }
  }
};
