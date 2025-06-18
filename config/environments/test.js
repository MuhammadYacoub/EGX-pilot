// Test Environment Configuration
module.exports = {
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
  },
  jwt: {
    secret: 'test-secret-key',
    expiresIn: '1h',
    issuer: 'EGXpilot-test',
    audience: 'EGXpilot-users'
  },
  server: {
    port: 5001,
    host: '0.0.0.0'
  },
  logging: {
    level: 'error',
    format: 'minimal'
  }
};
