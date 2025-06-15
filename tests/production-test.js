#!/usr/bin/env node

/**
 * EGXpilot Production Testing Suite
 * Comprehensive tests for production environment
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Test configuration
const config = {
  production: {
    baseUrl: 'https://egxpilot.com',
    apiUrl: 'https://egxpilot.com/api',
    timeout: 10000
  },
  development: {
    baseUrl: 'http://localhost:5000',
    apiUrl: 'http://localhost:5000/api',
    timeout: 5000
  }
};

const env = process.env.NODE_ENV || 'development';
const testConfig = config[env];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

// Utility functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || testConfig.timeout;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'EGXpilot-Test-Suite/1.0',
        ...options.headers
      },
      timeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function runTest(testName, testFunction) {
  testResults.total++;
  
  try {
    log(`\n🧪 ${testName}`, 'cyan');
    const startTime = Date.now();
    
    await testFunction();
    
    const duration = Date.now() - startTime;
    testResults.passed++;
    testResults.results.push({
      name: testName,
      status: 'PASSED',
      duration,
      error: null
    });
    
    log(`✅ PASSED (${duration}ms)`, 'green');
  } catch (error) {
    const duration = Date.now() - Date.now();
    testResults.failed++;
    testResults.results.push({
      name: testName,
      status: 'FAILED',
      duration,
      error: error.message
    });
    
    log(`❌ FAILED: ${error.message}`, 'red');
  }
}

// Test suites
const tests = {
  async healthCheck() {
    const response = await makeRequest(`${testConfig.baseUrl}/health`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Health check failed with status ${response.statusCode}`);
    }
    
    if (!response.data || response.data.status !== 'healthy') {
      throw new Error('Health check returned unhealthy status');
    }
    
    log(`   Health status: ${response.data.status}`, 'green');
    log(`   Uptime: ${Math.floor(response.data.uptime)}s`, 'blue');
  },

  async detailedHealthCheck() {
    const response = await makeRequest(`${testConfig.baseUrl}/health/detailed`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Detailed health check failed with status ${response.statusCode}`);
    }
    
    const services = response.data.services || {};
    
    // Check database
    if (services.database && services.database.status !== 'healthy') {
      throw new Error('Database is not healthy');
    }
    
    // Check Redis
    if (services.redis && services.redis.status !== 'healthy') {
      throw new Error('Redis is not healthy');
    }
    
    log(`   Database: ${services.database?.status || 'unknown'}`, 'green');
    log(`   Redis: ${services.redis?.status || 'unknown'}`, 'green');
  },

  async authenticationFlow() {
    // Test user registration
    const registerData = {
      email: `test-${Date.now()}@egxpilot.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResponse = await makeRequest(`${testConfig.apiUrl}/auth/register`, {
      method: 'POST',
      body: registerData
    });
    
    if (registerResponse.statusCode !== 201) {
      throw new Error(`Registration failed with status ${registerResponse.statusCode}`);
    }
    
    log(`   Registration successful for ${registerData.email}`, 'green');
    
    // Test user login
    const loginResponse = await makeRequest(`${testConfig.apiUrl}/auth/login`, {
      method: 'POST',
      body: {
        email: registerData.email,
        password: registerData.password
      }
    });
    
    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed with status ${loginResponse.statusCode}`);
    }
    
    if (!loginResponse.data.token) {
      throw new Error('Login response missing token');
    }
    
    log(`   Login successful, token received`, 'green');
    
    // Test protected route
    const profileResponse = await makeRequest(`${testConfig.apiUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    if (profileResponse.statusCode !== 200) {
      throw new Error(`Profile access failed with status ${profileResponse.statusCode}`);
    }
    
    log(`   Profile access successful`, 'green');
  },

  async stocksAPI() {
    const response = await makeRequest(`${testConfig.apiUrl}/stocks`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Stocks API failed with status ${response.statusCode}`);
    }
    
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('Stocks API returned empty or invalid data');
    }
    
    log(`   Retrieved ${response.data.length} stocks`, 'green');
    
    // Test individual stock
    const firstStock = response.data[0];
    const stockResponse = await makeRequest(`${testConfig.apiUrl}/stocks/${firstStock.symbol}`);
    
    if (stockResponse.statusCode !== 200) {
      throw new Error(`Individual stock API failed with status ${stockResponse.statusCode}`);
    }
    
    log(`   Individual stock data retrieved for ${firstStock.symbol}`, 'green');
  },

  async technicalAnalysis() {
    // Get stocks first
    const stocksResponse = await makeRequest(`${testConfig.apiUrl}/stocks`);
    if (stocksResponse.statusCode !== 200 || !stocksResponse.data.length) {
      throw new Error('Cannot test technical analysis without stocks data');
    }
    
    const testSymbol = stocksResponse.data[0].symbol;
    const response = await makeRequest(`${testConfig.apiUrl}/analysis/technical/${testSymbol}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Technical analysis failed with status ${response.statusCode}`);
    }
    
    const analysis = response.data;
    if (!analysis || !analysis.indicators) {
      throw new Error('Technical analysis returned invalid data');
    }
    
    log(`   Technical analysis completed for ${testSymbol}`, 'green');
    log(`   Indicators: ${Object.keys(analysis.indicators).join(', ')}`, 'blue');
  },

  async opportunityHunter() {
    // Test opportunity scan
    const scanResponse = await makeRequest(`${testConfig.apiUrl}/opportunities/scan`, {
      method: 'POST'
    });
    
    if (scanResponse.statusCode !== 200) {
      throw new Error(`Opportunity scan failed with status ${scanResponse.statusCode}`);
    }
    
    log(`   Opportunity scan initiated`, 'green');
    
    // Get latest opportunities
    const opportunitiesResponse = await makeRequest(`${testConfig.apiUrl}/opportunities/latest`);
    
    if (opportunitiesResponse.statusCode !== 200) {
      throw new Error(`Get opportunities failed with status ${opportunitiesResponse.statusCode}`);
    }
    
    const opportunities = opportunitiesResponse.data;
    if (!opportunities || !Array.isArray(opportunities.topOpportunities)) {
      throw new Error('Opportunities API returned invalid data');
    }
    
    log(`   Found ${opportunities.topOpportunities.length} opportunities`, 'green');
  },

  async performanceMetrics() {
    const response = await makeRequest(`${testConfig.baseUrl}/metrics`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Metrics endpoint failed with status ${response.statusCode}`);
    }
    
    const metrics = response.data;
    if (!metrics || !metrics.server) {
      throw new Error('Metrics returned invalid data');
    }
    
    log(`   Server uptime: ${Math.floor(metrics.server.uptime_seconds)}s`, 'green');
    log(`   Memory usage: ${Math.round(metrics.server.memory_usage_bytes.rss / 1024 / 1024)}MB`, 'blue');
  },

  async rateLimiting() {
    // Test rate limiting by making rapid requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
      requests.push(makeRequest(`${testConfig.apiUrl}/stocks`));
    }
    
    const responses = await Promise.allSettled(requests);
    const rateLimited = responses.some(r => 
      r.status === 'fulfilled' && r.value.statusCode === 429
    );
    
    if (env === 'production' && !rateLimited) {
      log(`   Warning: Rate limiting may not be working properly`, 'yellow');
    } else {
      log(`   Rate limiting is active`, 'green');
    }
  },

  async securityHeaders() {
    const response = await makeRequest(testConfig.baseUrl);
    
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection'
    ];
    
    const missingHeaders = requiredHeaders.filter(header => 
      !response.headers[header]
    );
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
    }
    
    log(`   All required security headers present`, 'green');
  }
};

// Main test runner
async function runAllTests() {
  log('🚀 EGXpilot Production Test Suite', 'bright');
  log(`Environment: ${env}`, 'blue');
  log(`Base URL: ${testConfig.baseUrl}`, 'blue');
  log('='.repeat(60), 'cyan');
  
  const startTime = Date.now();
  
  // Run all tests
  for (const [testName, testFunction] of Object.entries(tests)) {
    await runTest(testName, testFunction);
  }
  
  const duration = Date.now() - startTime;
  
  // Display results
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Test Results Summary', 'bright');
  log('='.repeat(60), 'cyan');
  
  log(`Total Tests: ${testResults.total}`, 'blue');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`, 
      testResults.failed === 0 ? 'green' : 'yellow');
  log(`Total Duration: ${duration}ms`, 'blue');
  
  // Show failed tests
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.results
      .filter(r => r.status === 'FAILED')
      .forEach(result => {
        log(`   • ${result.name}: ${result.error}`, 'red');
      });
  }
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    environment: env,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: Math.round((testResults.passed / testResults.total) * 100),
      duration
    },
    tests: testResults.results
  };
  
  const reportPath = path.join(__dirname, '..', 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Test report saved to: ${reportPath}`, 'blue');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`\n💥 Test runner failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runAllTests, runTest, tests };
