const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'curhi6-qEbfid',
    server: 'sqlserver',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000,
        requestTimeout: 30000
    }
};

async function createDatabase() {
    console.log('🎯 Creating EGXpilot database...');
    
    try {
        // Connect to master database first
        const pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server');
        
        // Check if database exists
        const dbCheck = await pool.request().query(`
            SELECT name FROM sys.databases WHERE name = 'egxpilot_dev'
        `);
        
        if (dbCheck.recordset.length > 0) {
            console.log('✅ Database egxpilot_dev already exists');
        } else {
            // Create database
            await pool.request().query(`CREATE DATABASE egxpilot_dev`);
            console.log('✅ Database egxpilot_dev created successfully');
        }
        
        await pool.close();
        console.log('✅ Database creation completed');
        
    } catch (error) {
        console.error('❌ Failed to create database:', error.message);
        throw error;
    }
}

createDatabase();
