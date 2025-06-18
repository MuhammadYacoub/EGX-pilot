// Test database connection for development
require('dotenv').config();
const sql = require('mssql');

const config = {
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
  }
};

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    console.log('Config:', {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password ? '***' : 'undefined'
    });
    
    const pool = await sql.connect(config);
    console.log('✅ Database connection successful!');
    
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('Database version:', result.recordset[0].version);
    
    await pool.close();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

testConnection();
