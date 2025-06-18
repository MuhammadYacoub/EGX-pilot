const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'curhi6-qEbfid',
    server: '41.38.217.73',
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 10000,
        requestTimeout: 10000
    }
};

console.log('Starting connection test...');
console.log('Config:', {
    server: config.server,
    port: config.port,
    user: config.user,
    password: '***'
});

sql.connect(config)
    .then(pool => {
        console.log('✅ Connected successfully!');
        return pool.request().query('SELECT 1 as test');
    })
    .then(result => {
        console.log('✅ Query result:', result.recordset);
        return sql.close();
    })
    .then(() => {
        console.log('✅ Connection closed');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        console.error('Error code:', err.code);
        process.exit(1);
    });

// Timeout after 15 seconds
setTimeout(() => {
    console.log('❌ Timeout - operation took too long');
    process.exit(1);
}, 15000);
