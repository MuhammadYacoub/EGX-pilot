const OpportunityHunter = require('../smart-analysis/opportunity-hunter/scannerEngine');
const logger = require('../utils/logger');

/**
 * Opportunity Hunter Service
 * Main service for managing opportunity scanning operations
 */
class OpportunityHunterService {
  constructor() {
    this.scanner = new OpportunityHunter();
    this.isInitialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('OpportunityHunterService already initialized');
      return;
    }

    try {
      await this.scanner.initialize();
      this.isInitialized = true;
      logger.info('✅ OpportunityHunterService initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize OpportunityHunterService:', error);
      throw error;
    }
  }

  /**
   * Start scanning
   */
  async startScanning() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    await this.scanner.startScanning();
  }

  /**
   * Stop scanning
   */
  stopScanning() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    this.scanner.stopScanning();
  }

  /**
   * Get latest opportunities
   */
  async getLatestOpportunities() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    return await this.scanner.getLatestOpportunities();
  }

  /**
   * Get opportunity details for a specific symbol
   */
  async getOpportunityDetails(symbol) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    return await this.scanner.getOpportunityDetails(symbol);
  }

  /**
   * Force a rescan of the market
   */
  async forceRescan() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    return await this.scanner.forceRescan();
  }

  /**
   * Get scanning status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      scanning: this.scanner.isScanning,
      lastScanTime: this.scanner.lastScanTime,
      totalOpportunities: this.scanner.scanResults.length
    };
  }
}

// Create singleton instance
const opportunityHunterService = new OpportunityHunterService();

module.exports = opportunityHunterService;
