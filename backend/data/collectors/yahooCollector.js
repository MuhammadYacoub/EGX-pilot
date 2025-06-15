const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const { cache } = require('../../../config/redis');

/**
 * Yahoo Finance Data Collector
 * Collects real-time and historical data from Yahoo Finance
 */
class YahooCollector {
  constructor() {
    this.baseUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.quotesUrl = 'https://query1.finance.yahoo.com/v7/finance/quote';
    this.historyUrl = 'https://query1.finance.yahoo.com/v8/finance/chart';
    this.rateLimit = 100; // requests per minute
    this.requestCount = 0;
    this.lastReset = Date.now();
  }

  /**
   * Check and enforce rate limiting
   * @private
   */
  async checkRateLimit() {
    const now = Date.now();
    const timeDiff = now - this.lastReset;
    
    if (timeDiff >= 60000) { // Reset every minute
      this.requestCount = 0;
      this.lastReset = now;
    }
    
    if (this.requestCount >= this.rateLimit) {
      const waitTime = 60000 - timeDiff;
      logger.warn(`Yahoo Finance rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastReset = Date.now();
    }
    
    this.requestCount++;
  }

  /**
   * Get real-time stock data
   * @param {string} symbol - Stock symbol (e.g., 'COMI.CA')
   * @returns {Promise<Object>} Real-time stock data
   */
  async getRealTimeData(symbol) {
    try {
      await this.checkRateLimit();
      
      // Check cache first
      const cacheKey = `yahoo:realtime:${symbol}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${this.quotesUrl}?symbols=${symbol}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const data = response.data.quoteResponse.result[0];
      
      if (!data) {
        throw new Error(`No data found for symbol: ${symbol}`);
      }

      const result = {
        symbol: data.symbol,
        price: data.regularMarketPrice,
        change: data.regularMarketChange,
        changePercent: data.regularMarketChangePercent,
        volume: data.regularMarketVolume,
        marketCap: data.marketCap,
        high: data.regularMarketDayHigh,
        low: data.regularMarketDayLow,
        open: data.regularMarketOpen,
        previousClose: data.regularMarketPreviousClose,
        timestamp: new Date(data.regularMarketTime * 1000).toISOString(),
        source: 'yahoo'
      };

      // Cache for 1 minute
      await cache.set(cacheKey, result, 60);
      
      return result;
    } catch (error) {
      logger.error(`Yahoo Finance real-time data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch real-time data for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get historical data
   * @param {string} symbol - Stock symbol
   * @param {string} period - Period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
   * @param {string} interval - Interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
   * @returns {Promise<Array>} Historical price data
   */
  async getHistoricalData(symbol, period = '1y', interval = '1d') {
    try {
      await this.checkRateLimit();
      
      // Check cache first
      const cacheKey = `yahoo:historical:${symbol}:${period}:${interval}`;
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${this.historyUrl}/${symbol}`, {
        params: {
          period1: this.getPeriodStart(period),
          period2: Math.floor(Date.now() / 1000),
          interval: interval,
          includePrePost: false,
          events: 'div,splits'
        },
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const chart = response.data.chart.result[0];
      
      if (!chart || !chart.timestamp) {
        throw new Error(`No historical data found for symbol: ${symbol}`);
      }

      const timestamps = chart.timestamp;
      const quotes = chart.indicators.quote[0];
      
      const result = timestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        timestamp: new Date(timestamp * 1000).toISOString(),
        open: quotes.open[index],
        high: quotes.high[index],
        low: quotes.low[index],
        close: quotes.close[index],
        volume: quotes.volume[index],
        symbol: symbol
      })).filter(item => 
        item.open !== null && 
        item.high !== null && 
        item.low !== null && 
        item.close !== null
      );

      // Cache for different TTLs based on interval
      const ttl = this.getCacheTTL(interval);
      await cache.set(cacheKey, result, ttl);
      
      return result;
    } catch (error) {
      logger.error(`Yahoo Finance historical data error for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch historical data for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Get multiple stocks data in batch
   * @param {string[]} symbols - Array of stock symbols
   * @returns {Promise<Object>} Object with symbol as key and data as value
   */
  async getBatchData(symbols) {
    try {
      await this.checkRateLimit();
      
      const symbolsStr = symbols.join(',');
      const response = await axios.get(`${this.quotesUrl}?symbols=${symbolsStr}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const results = {};
      const quotes = response.data.quoteResponse.result;
      
      quotes.forEach(data => {
        if (data && data.symbol) {
          results[data.symbol] = {
            symbol: data.symbol,
            price: data.regularMarketPrice,
            change: data.regularMarketChange,
            changePercent: data.regularMarketChangePercent,
            volume: data.regularMarketVolume,
            marketCap: data.marketCap,
            high: data.regularMarketDayHigh,
            low: data.regularMarketDayLow,
            open: data.regularMarketOpen,
            previousClose: data.regularMarketPreviousClose,
            timestamp: new Date(data.regularMarketTime * 1000).toISOString(),
            source: 'yahoo'
          };
        }
      });

      return results;
    } catch (error) {
      logger.error('Yahoo Finance batch data error:', error.message);
      throw new Error(`Failed to fetch batch data: ${error.message}`);
    }
  }

  /**
   * Get period start timestamp
   * @private
   * @param {string} period - Period string
   * @returns {number} Unix timestamp
   */
  getPeriodStart(period) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    switch (period) {
      case '1d': return Math.floor((now - day) / 1000);
      case '5d': return Math.floor((now - 5 * day) / 1000);
      case '1mo': return Math.floor((now - 30 * day) / 1000);
      case '3mo': return Math.floor((now - 90 * day) / 1000);
      case '6mo': return Math.floor((now - 180 * day) / 1000);
      case '1y': return Math.floor((now - 365 * day) / 1000);
      case '2y': return Math.floor((now - 730 * day) / 1000);
      case '5y': return Math.floor((now - 1825 * day) / 1000);
      case '10y': return Math.floor((now - 3650 * day) / 1000);
      case 'ytd': {
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        return Math.floor(yearStart.getTime() / 1000);
      }
      case 'max': return Math.floor((now - 50 * 365 * day) / 1000);
      default: return Math.floor((now - 365 * day) / 1000);
    }
  }

  /**
   * Get cache TTL based on interval
   * @private
   * @param {string} interval - Data interval
   * @returns {number} TTL in seconds
   */
  getCacheTTL(interval) {
    switch (interval) {
      case '1m':
      case '2m':
      case '5m': return 60; // 1 minute
      case '15m':
      case '30m': return 300; // 5 minutes
      case '60m':
      case '90m':
      case '1h': return 900; // 15 minutes
      case '1d': return 3600; // 1 hour
      default: return 86400; // 24 hours
    }
  }
}

module.exports = YahooCollector;
