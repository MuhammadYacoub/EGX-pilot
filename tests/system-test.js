// Simple System Test
// Tests basic functionality without requiring database setup

const path = require('path');

// Simple test runner
async function runTests() {
    console.log('🧪 Running EGXpilot System Tests...\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Environment Loading
    try {
        require('dotenv').config();
        console.log('✅ Environment Config: PASSED');
        passed++;
    } catch (error) {
        console.log('❌ Environment Config: FAILED -', error.message);
        failed++;
    }
    
    // Test 2: Required Dependencies
    try {
        require('express');
        require('jsonwebtoken');
        require('bcryptjs');
        require('mssql');
        require('uuid');
        console.log('✅ Dependencies: PASSED');
        passed++;
    } catch (error) {
        console.log('❌ Dependencies: FAILED -', error.message);
        failed++;
    }
    
    // Test 3: JWT Token Generation
    try {
        const jwt = require('jsonwebtoken');
        const secret = 'test-secret-key';
        const payload = { userId: '123', email: 'test@example.com' };
        
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });
        const decoded = jwt.verify(token, secret);
        
        if (decoded.userId === '123') {
            console.log('✅ JWT Token Generation: PASSED');
            passed++;
        } else {
            console.log('❌ JWT Token Generation: FAILED');
            failed++;
        }
    } catch (error) {
        console.log('❌ JWT Token Generation: FAILED -', error.message);
        failed++;
    }
    
    // Test 4: File Structure
    try {
        const fs = require('fs');
        const requiredFiles = [
            'backend/server.js',
            'backend/models/User.js',
            'backend/models/Stock.js',
            'backend/models/Portfolio.js',
            'config/database.js',
            'package.json'
        ];
        
        let allExists = true;
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, '..', file))) {
                allExists = false;
                break;
            }
        }
        
        if (allExists) {
            console.log('✅ File Structure: PASSED');
            passed++;
        } else {
            console.log('❌ File Structure: FAILED');
            failed++;
        }
    } catch (error) {
        console.log('❌ File Structure: FAILED -', error.message);
        failed++;
    }
    
    // Test 5: Configuration Loading
    try {
        const config = require('../config/environment');
        if (config && config.database) {
            console.log('✅ Configuration Loading: PASSED');
            passed++;
        } else {
            console.log('❌ Configuration Loading: FAILED');
            failed++;
        }
    } catch (error) {
        console.log('❌ Configuration Loading: FAILED -', error.message);
        failed++;
    }
    
    // Summary
    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total:  ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! System is ready for development.');
        console.log('\n🚀 Next steps:');
        console.log('   1. Set up your SQL Server database');
        console.log('   2. Update the .env file with your database credentials');
        console.log('   3. Run: npm run init-db');
        console.log('   4. Start the server: npm run dev');
        console.log('   5. Test the API: curl http://localhost:5000/api/health');
        return 0;
    } else {
        console.log('\n⚠️  Some tests failed. Please check the configuration.');
        return 1;
    }
}

// Run if called directly
if (require.main === module) {
    runTests().then(process.exit).catch((error) => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = { runTests };
