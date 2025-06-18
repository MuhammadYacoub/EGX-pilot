const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'curhi6-qEbfid',
    server: '41.38.217.73',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 60000,
        requestTimeout: 60000
    }
};

async function testDirectConnection() {
    console.log('Testing direct connection...');
    console.log('Server: 41.38.217.73:1433');
    console.log('User: sa');
    
    try {
        console.log('\n📡 Connecting...');
        const pool = await sql.connect(config);
        console.log('✅ Connected successfully!');
        
        // Test query
        const result = await pool.request().query('SELECT @@VERSION as Version, GETDATE() as CurrentTime');
        console.log('✅ Query successful!');
        console.log('Version:', result.recordset[0].Version.substring(0, 50) + '...');
        console.log('Current Time:', result.recordset[0].CurrentTime);
        
        // List databases
        const dbResult = await pool.request().query('SELECT name FROM sys.databases WHERE name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')');
        console.log('Available databases:', dbResult.recordset.map(r => r.name));
        
        await pool.close();
        console.log('✅ Connection test completed successfully');
        
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        console.error('Error details:', error);
    }
}

testDirectConnection();
