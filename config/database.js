const sql = require('mssql');
const config = require('./environment');
const logger = require('../backend/utils/logger');

let poolPromise;

/**
 * Initialize database connection pool
 * @returns {Promise<sql.ConnectionPool>}
 */
async function connectDatabase() {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config.database);
      
      poolPromise.on('error', (err) => {
        logger.error('Database pool error:', err);
      });
      
      await poolPromise.connect();
      logger.info('✅ Connected to SQL Server database');
    }
    
    return poolPromise;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

/**
 * Get database connection pool
 * @returns {sql.ConnectionPool}
 */
function getDatabase() {
  if (!poolPromise) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return poolPromise;
}

/**
 * Execute a query with parameters
 * @param {string} query - SQL query
 * @param {Object} params - Query parameters
 * @returns {Promise<sql.IResult>}
 */
async function executeQuery(query, params = {}) {
  try {
    const pool = await connectDatabase();
    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    logger.error('Query execution failed:', { query, params, error: error.message });
    throw error;
  }
}

/**
 * Execute a stored procedure
 * @param {string} procedureName - Name of stored procedure
 * @param {Object} params - Procedure parameters
 * @returns {Promise<sql.IResult>}
 */
async function executeProcedure(procedureName, params = {}) {
  try {
    const pool = await connectDatabase();
    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    logger.error('Procedure execution failed:', { procedureName, params, error: error.message });
    throw error;
  }
}

/**
 * Transaction wrapper for multiple queries
 * @param {Function} transactionCallback - Function containing transaction logic
 * @returns {Promise<any>}
 */
async function executeTransaction(transactionCallback) {
  const pool = await connectDatabase();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    
    const result = await transactionCallback(request);
    
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    logger.error('Transaction failed and rolled back:', error);
    throw error;
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const pool = await getDatabase();
    const request = pool.request();
    const result = await request.query('SELECT 1 as test');
    return result.recordset[0].test === 1;
  } catch (error) {
    logger.error('Database test connection failed:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  try {
    if (poolPromise) {
      await poolPromise.close();
      poolPromise = null;
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

module.exports = {
  connectDatabase,
  getDatabase,
  executeQuery,
  executeProcedure,
  executeTransaction,
  closeDatabase,
  sql,
  testConnection
};
