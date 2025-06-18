// Environment Configuration for EGXpilot
require('dotenv').config();

const environment = process.env.NODE_ENV || 'development';

let config;
try {
  config = require(`./environments/${environment}`);
} catch (error) {
  console.warn(`Environment config for '${environment}' not found, falling back to development`);
  config = require('./environments/development');
}

module.exports = config;