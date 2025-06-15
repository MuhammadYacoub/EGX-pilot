const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 60000,
        requestTimeout: 60000
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function testConnection() {
    console.log('Testing connection with config:');
    console.log(`Server: ${config.server}`);
    console.log(`Port: ${config.port}`);
    console.log(`User: ${config.user}`);
    console.log(`Password: ${config.password ? '***' : 'NOT SET'}`);
    
    try {
        console.log('\n📡 Attempting to connect...');
        const pool = await sql.connect(config);
        console.log('✅ Connection successful!');
        
        const result = await pool.request().query('SELECT @@VERSION as Version');
        console.log('SQL Server Version:', result.recordset[0].Version);
        
        await pool.close();
        console.log('✅ Connection closed successfully');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === 'ELOGIN') {
            console.error('\n💡 Authentication failed. Please check credentials.');
        } else if (error.code === 'ETIMEOUT') {
            console.error('\n💡 Connection timeout. Check network and firewall.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Server not found. Check server address.');
        }
    }
}

testConnection();
