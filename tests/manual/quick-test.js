const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'curhi6-qEbfid',
    server: 'localhost',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 10000,
        requestTimeout: 10000
    }
};

async function quickTest() {
    console.log('🔍 Quick connection test to localhost:1433');
    
    try {
        const pool = await sql.connect(config);
        console.log('✅ Connected!');
        
        const result = await pool.request().query('SELECT 1 as Test');
        console.log('✅ Query successful:', result.recordset);
        
        await pool.close();
        console.log('✅ Test completed');
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

quickTest();
