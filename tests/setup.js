// Test Setup for EGXpilot
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Setup database connection for tests
beforeAll(async () => {
  // Database setup will be added here
});

afterAll(async () => {
  // Cleanup after tests
});
