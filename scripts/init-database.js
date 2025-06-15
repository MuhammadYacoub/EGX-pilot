#!/usr/bin/env node
// Database Initialization Script
// This script sets up the EGXpilot database with all required tables, procedures, and seed data

const sql = require('mssql');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'egxpilot_dev',
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function executeScriptFile(pool, filePath) {
    try {
        console.log(`Executing: ${path.basename(filePath)}`);
        const script = await fs.readFile(filePath, 'utf8');
        
        // Split script by GO statements and execute each batch
        const batches = script.split(/\nGO\s*$/gm).filter(batch => batch.trim());
        
        for (const batch of batches) {
            if (batch.trim()) {
                await pool.request().query(batch);
            }
        }
        
        console.log(`✅ Completed: ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`❌ Error executing ${filePath}:`, error.message);
        throw error;
    }
}

async function initializeDatabase() {
    let pool;
    
    try {
        console.log('🚀 Starting EGXpilot database initialization...\n');
        
        // Connect to SQL Server
        console.log('📡 Connecting to SQL Server...');
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server\n');
        
        // Define script execution order
        const scriptsOrder = [
            'database/migrations/001_initial_setup.sql',
            'database/schema/01_create_tables.sql',
            'database/procedures/01_common_procedures.sql',
            'database/seeds/01_stocks_data.sql'
        ];
        
        // Execute scripts in order
        for (const scriptPath of scriptsOrder) {
            const fullPath = path.join(__dirname, '..', scriptPath);
            
            try {
                await fs.access(fullPath);
                await executeScriptFile(pool, fullPath);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.log(`⚠️  Skipping missing file: ${scriptPath}`);
                } else {
                    throw error;
                }
            }
        }
        
        // Verify installation
        console.log('\n🔍 Verifying database setup...');
        
        const tableCount = await pool.request().query(`
            SELECT COUNT(*) as TableCount 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        
        const stockCount = await pool.request().query(`
            SELECT COUNT(*) as StockCount FROM Stocks WHERE IsActive = 1
        `);
        
        const userCount = await pool.request().query(`
            SELECT COUNT(*) as UserCount FROM Users
        `);
        
        console.log(`📊 Database Statistics:`);
        console.log(`   Tables created: ${tableCount.recordset[0].TableCount}`);
        console.log(`   Stocks loaded: ${stockCount.recordset[0].StockCount}`);
        console.log(`   Users created: ${userCount.recordset[0].UserCount}`);
        
        console.log('\n✅ Database initialization completed successfully!');
        console.log('\n🎯 Next steps:');
        console.log('   1. Update your .env file with correct database credentials');
        console.log('   2. Run: npm install');
        console.log('   3. Start the application: npm run dev');
        console.log('   4. Test the API: http://localhost:5000/api/health');
        
    } catch (error) {
        console.error('\n❌ Database initialization failed:', error.message);
        
        if (error.code === 'ELOGIN') {
            console.error('\n💡 Authentication failed. Please check:');
            console.error('   - Database server is running');
            console.error('   - Username and password are correct');
            console.error('   - Database exists');
        } else if (error.code === 'ETIMEOUT') {
            console.error('\n💡 Connection timeout. Please check:');
            console.error('   - Database server is accessible');
            console.error('   - Firewall settings');
            console.error('   - Network connectivity');
        }
        
        process.exit(1);
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };
