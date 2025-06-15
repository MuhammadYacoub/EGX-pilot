const YahooCollector = require('../../data/collectors/yahooCollector');
const MomentumIndicators = require('../indicators/momentum');
const logger = require('../../utils/logger');
const { cache } = require('../../../config/redis');
const cron = require('node-cron');

/**
 * Opportunity Hunter - Advanced Market Scanner
 * Scans EGX stocks for high-probability trading opportunities
 */
class OpportunityHunter {
  constructor() {
    this.dataCollector = new YahooCollector();
    this.isScanning = false;
    this.scanResults = [];
    this.lastScanTime = null;
    
    // EGX stock symbols - Top 50 most liquid stocks
    this.egxSymbols = [
      'CIB.CA', 'COMI.CA', 'ETEL.CA', 'HRHO.CA', 'EMFD.CA', 
      'PHDC.CA', 'AMER.CA', 'TMGH.CA', 'EGTS.CA', 'EWHR.CA',
      'MNHD.CA', 'SKPC.CA', 'EZDK.CA', 'JUFO.CA', 'EIPICO.CA',
      'ELSS.CA', 'MTIE.CA', 'EGCH.CA', 'CCAP.CA', 'ORHD.CA',
      'GTHE.CA', 'IBKP.CA', 'EFID.CA', 'ESRS.CA', 'NTRA.CA',
      'MCDR.CA', 'ISPH.CA', 'EAST.CA', 'FWRY.CA', 'RMTG.CA',
      'EGAL.CA', 'ARAB.CA', 'ELRW.CA', 'OCDI.CA', 'IRAX.CA',
      'IIND.CA', 'UEGC.CA', 'EKHO.CA', 'SPMD.CA', 'PAINTS.CA',
      'ACGC.CA', 'MMTB.CA', 'AMOC.CA', 'NCGC.CA', 'CIRA.CA',
      'BLDP.CA', 'MISR.CA', 'PRDC.CA', 'CLHO.CA', 'EDBE.CA'
    ];

    // Scanning configuration
    this.scanConfig = {
      minVolume: 100000,           // Minimum daily volume
      minPrice: 1.0,               // Minimum stock price (EGP)
      maxPrice: 1000.0,            // Maximum stock price (EGP)
      minMarketCap: 50000000,      // Minimum market cap (50M EGP)
      excludeSectors: ['REITS'],   // Excluded sectors
      scanInterval: 300000,        // 5 minutes scan interval
      maxResults: 20,              // Top 20 opportunities
      minOpportunityScore: 0.65    // Minimum score to qualify
    };

    // Signal detection criteria and weights
    this.signalCriteria = {
      momentum: {
        rsi: { oversold: 30, bullishDivergence: true },
        macd: { bullishCrossover: true, histogram: 'positive' },
        stochastic: { oversold: 20, bullishCross: true },
        adx: { trending: 25, direction: 'up' },
        weight: 0.25
      },
      volume: {
        volumeSpike: 2.0,           // 2x average volume
        priceVolumeConfirmation: true,
        onBalanceVolume: 'bullish',
        volumeProfile: 'accumulation',
        weight: 0.20
      },
      priceAction: {
        breakoutLevel: true,        // Breaking resistance
        supportHold: true,          // Holding key support
        higherLows: 3,             // Minimum 3 higher lows
        consolidation: 'bullish',   // Bullish consolidation
        weight: 0.25
      },
      patterns: {
        candlestick: {
          bullishEngulfing: 0.8,
          hammer: 0.6,
          morningStar: 0.9,
          bullishMarubozu: 0.7
        },
        chartPatterns: {
          ascendingTriangle: 0.8,
          cupAndHandle: 0.9,
          flagPattern: 0.7,
          doubleBottom: 0.8
        },
        wyckoff: {
          accumulation: 0.9,
          springTest: 0.8,
          markup: 0.7
        },
        weight: 0.30
      }
    };
  }

  /**
   * Initialize the opportunity hunter
   */
  async initialize() {
    try {
      logger.info('🎯 Initializing Opportunity Hunter...');
      
      // Load historical performance data
      await this.loadHistoricalPerformance();
      
      // Setup scheduled scanning
      this.setupScheduledScanning();
      
      logger.info('✅ Opportunity Hunter initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Opportunity Hunter:', error);
      throw error;
    }
  }

  /**
   * Start continuous scanning
   */
  async startScanning() {
    if (this.isScanning) {
      logger.warn('Opportunity Hunter is already scanning');
      return;
    }

    this.isScanning = true;
    logger.info('🚀 Starting Opportunity Hunter scanning...');
    
    // Run initial scan
    await this.performScan();
  }

  /**
   * Stop scanning
   */
  stopScanning() {
    this.isScanning = false;
    logger.info('⏹️ Opportunity Hunter scanning stopped');
  }

  /**
   * Perform a complete market scan
   */
  async performScan() {
    try {
      const scanStartTime = Date.now();
      logger.info(`🔍 Starting market scan of ${this.egxSymbols.length} stocks...`);

      // Get market data for all symbols
      const marketData = await this.getMarketData();
      
      // Analyze each stock for opportunities
      const opportunities = [];
      for (const symbol of Object.keys(marketData)) {
        try {
          const stockData = marketData[symbol];
          if (this.passesInitialFilter(stockData)) {
            const opportunity = await this.analyzeStockOpportunity(symbol, stockData);
            if (opportunity && opportunity.score >= this.scanConfig.minOpportunityScore) {
              opportunities.push(opportunity);
            }
          }
        } catch (error) {
          logger.warn(`Failed to analyze ${symbol}:`, error.message);
        }
      }

      // Rank and filter opportunities
      const rankedOpportunities = this.rankOpportunities(opportunities);
      const topOpportunities = rankedOpportunities.slice(0, this.scanConfig.maxResults);

      // Update results
      this.scanResults = topOpportunities;
      this.lastScanTime = new Date().toISOString();

      // Cache results
      await cache.set('opportunity_hunter:latest_scan', {
        scanTime: this.lastScanTime,
        totalScanned: this.egxSymbols.length,
        qualified: opportunities.length,
        topOpportunities: topOpportunities.length,
        opportunities: topOpportunities
      }, 300);

      // Check for alerts
      await this.checkForAlerts(topOpportunities);

      const scanDuration = Date.now() - scanStartTime;
      logger.info(`✅ Market scan completed in ${scanDuration}ms. Found ${topOpportunities.length} qualified opportunities`);

      return topOpportunities;
    } catch (error) {
      logger.error('❌ Market scan failed:', error);
      throw error;
    }
  }

  /**
   * Get market data for all symbols
   * @private
   */
  async getMarketData() {
    try {
      // Try to get batch data first
      const batchData = await this.dataCollector.getBatchData(this.egxSymbols);
      
      // Get historical data for technical analysis
      const marketData = {};
      for (const symbol of this.egxSymbols) {
        if (batchData[symbol]) {
          try {
            const historicalData = await this.dataCollector.getHistoricalData(symbol, '6mo', '1d');
            marketData[symbol] = {
              ...batchData[symbol],
              historical: historicalData
            };
          } catch (error) {
            logger.warn(`Failed to get historical data for ${symbol}:`, error.message);
          }
        }
      }

      return marketData;
    } catch (error) {
      logger.error('Failed to get market data:', error);
      throw error;
    }
  }

  /**
   * Check if stock passes initial filters
   * @private
   */
  passesInitialFilter(stockData) {
    if (!stockData || !stockData.price || !stockData.volume) {
      return false;
    }

    return (
      stockData.price >= this.scanConfig.minPrice &&
      stockData.price <= this.scanConfig.maxPrice &&
      stockData.volume >= this.scanConfig.minVolume &&
      (stockData.marketCap || 0) >= this.scanConfig.minMarketCap
    );
  }

  /**
   * Analyze individual stock for opportunities
   * @private
   */
  async analyzeStockOpportunity(symbol, stockData) {
    try {
      if (!stockData.historical || stockData.historical.length < 50) {
        return null;
      }

      const prices = stockData.historical.map(d => d.close);
      const high = stockData.historical.map(d => d.high);
      const low = stockData.historical.map(d => d.low);
      const volume = stockData.historical.map(d => d.volume);

      // Calculate technical indicators
      const indicators = await this.calculateIndicators(prices, high, low, volume);
      
      // Analyze signals
      const signals = {
        momentum: this.analyzeMomentumSignals(indicators, stockData),
        volume: this.analyzeVolumeSignals(volume, prices, stockData),
        priceAction: this.analyzePriceActionSignals(prices, high, low, stockData),
        patterns: this.analyzePatternSignals(prices, high, low, volume, stockData)
      };

      // Calculate overall opportunity score
      const score = this.calculateOpportunityScore(signals);
      
      if (score < this.scanConfig.minOpportunityScore) {
        return null;
      }

      // Generate recommendation
      const recommendation = this.generateRecommendation(signals, score, stockData);

      return {
        symbol: symbol,
        companyName: this.getCompanyName(symbol),
        sector: this.getSector(symbol),
        currentPrice: stockData.price,
        discoveryTime: new Date().toISOString(),
        score: score,
        confidence: this.calculateConfidence(signals),
        signals: signals,
        recommendation: recommendation,
        catalysts: this.identifyCatalysts(signals, stockData),
        timeframe: this.estimateTimeframe(signals),
        riskLevel: this.assessRisk(stockData, signals)
      };
    } catch (error) {
      logger.error(`Failed to analyze opportunity for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Calculate technical indicators
   * @private
   */
  async calculateIndicators(prices, high, low, volume) {
    try {
      return {
        rsi: MomentumIndicators.calculateRSI(prices, 14),
        macd: MomentumIndicators.calculateMACD(prices, 12, 26, 9),
        stochastic: MomentumIndicators.calculateStochastic(high, low, prices, 14, 3),
        adx: MomentumIndicators.calculateADX(high, low, prices, 14),
        momentum: MomentumIndicators.calculateMomentum(prices, 10)
      };
    } catch (error) {
      logger.error('Failed to calculate indicators:', error);
      return {};
    }
  }

  /**
   * Analyze momentum signals
   * @private
   */
  analyzeMomentumSignals(indicators, stockData) {
    let score = 0;
    const signals = {};

    // RSI Analysis
    if (indicators.rsi) {
      signals.rsi = {
        value: indicators.rsi.current,
        signal: indicators.rsi.signal
      };
      
      if (indicators.rsi.oversold && indicators.rsi.signal === 'bullish_momentum') {
        score += 0.3;
      } else if (indicators.rsi.current < 35 && indicators.rsi.current > 25) {
        score += 0.2;
      }
    }

    // MACD Analysis
    if (indicators.macd) {
      signals.macd = {
        signal: indicators.macd.signal,
        strength: indicators.macd.strength
      };
      
      if (indicators.macd.signal === 'bullish_crossover') {
        score += 0.3;
      } else if (indicators.macd.signal === 'strengthening_bullish') {
        score += 0.2;
      }
    }

    // Stochastic Analysis
    if (indicators.stochastic) {
      signals.stochastic = {
        signal: indicators.stochastic.signal
      };
      
      if (indicators.stochastic.bullishCross && indicators.stochastic.oversold) {
        score += 0.25;
      }
    }

    // ADX Analysis
    if (indicators.adx) {
      signals.adx = {
        value: indicators.adx.current?.adx,
        trend: indicators.adx.trendDirection
      };
      
      if (indicators.adx.trending && indicators.adx.trendDirection === 'uptrend') {
        score += 0.15;
      }
    }

    return { score: Math.min(score, 1), details: signals };
  }

  /**
   * Analyze volume signals
   * @private
   */
  analyzeVolumeSignals(volume, prices, stockData) {
    let score = 0;
    const signals = {};

    // Calculate volume averages
    const recentVolume = volume.slice(-5);
    const avgVolume20 = volume.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volume[volume.length - 1];

    // Volume spike detection
    const volumeSpike = currentVolume / avgVolume20;
    signals.spike = volumeSpike;

    if (volumeSpike > 3) {
      score += 0.4;
    } else if (volumeSpike > 2) {
      score += 0.3;
    } else if (volumeSpike > 1.5) {
      score += 0.2;
    }

    // Sustained volume
    const sustainedVolume = recentVolume.reduce((a, b) => a + b, 0) / 5 / avgVolume20;
    signals.sustainedVolume = sustainedVolume;

    if (sustainedVolume > 1.5) {
      score += 0.2;
    }

    // Price-volume confirmation
    const recentPrices = prices.slice(-5);
    const priceDirection = recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'up' : 'down';
    const volumeDirection = sustainedVolume > 1 ? 'high' : 'low';

    if (priceDirection === 'up' && volumeDirection === 'high') {
      signals.priceVolumeConfirmation = true;
      score += 0.2;
    }

    return { score: Math.min(score, 1), details: signals };
  }

  /**
   * Analyze price action signals
   * @private
   */
  analyzePriceActionSignals(prices, high, low, stockData) {
    let score = 0;
    const signals = {};

    // Support and resistance levels
    const supportResistance = this.calculateSupportResistance(high, low, prices);
    signals.supportResistance = supportResistance;

    // Breakout detection
    const currentPrice = prices[prices.length - 1];
    const isBreakout = currentPrice > supportResistance.resistance * 1.01;
    signals.breakout = isBreakout;

    if (isBreakout) {
      score += 0.4;
    }

    // Higher lows pattern
    const higherLowsCount = this.countHigherLows(prices.slice(-10));
    signals.higherLows = higherLowsCount;

    if (higherLowsCount >= 3) {
      score += 0.3;
    }

    // Support hold
    const supportHold = currentPrice > supportResistance.support * 0.99;
    signals.supportHold = supportHold;

    if (supportHold) {
      score += 0.2;
    }

    return { score: Math.min(score, 1), details: signals };
  }

  /**
   * Analyze pattern signals
   * @private
   */
  analyzePatternSignals(prices, high, low, volume, stockData) {
    let score = 0;
    const signals = {};

    // Candlestick patterns (simplified)
    const candlestickPattern = this.detectCandlestickPatterns(prices, high, low);
    signals.candlestick = candlestickPattern;

    if (candlestickPattern.bullish) {
      score += candlestickPattern.strength * 0.3;
    }

    // Chart patterns (simplified)
    const chartPattern = this.detectChartPatterns(prices, volume);
    signals.chartPattern = chartPattern;

    if (chartPattern.bullish) {
      score += chartPattern.strength * 0.4;
    }

    // Wyckoff analysis (simplified)
    const wyckoffStage = this.analyzeWyckoffStage(prices, volume);
    signals.wyckoff = wyckoffStage;

    if (wyckoffStage.stage === 'accumulation' || wyckoffStage.stage === 'markup') {
      score += wyckoffStage.confidence * 0.3;
    }

    return { score: Math.min(score, 1), details: signals };
  }

  /**
   * Calculate overall opportunity score
   * @private
   */
  calculateOpportunityScore(signals) {
    const weights = this.signalCriteria;
    
    return (
      signals.momentum.score * weights.momentum.weight +
      signals.volume.score * weights.volume.weight +
      signals.priceAction.score * weights.priceAction.weight +
      signals.patterns.score * weights.patterns.weight
    );
  }

  /**
   * Generate trading recommendation
   * @private
   */
  generateRecommendation(signals, score, stockData) {
    const price = stockData.price;
    let action = 'HOLD';
    let urgency = 'LOW';

    if (score >= 0.85) {
      action = 'STRONG_BUY';
      urgency = 'HIGH';
    } else if (score >= 0.75) {
      action = 'BUY';
      urgency = 'MEDIUM';
    } else if (score >= 0.65) {
      action = 'WEAK_BUY';
      urgency = 'LOW';
    }

    // Calculate entry zone
    const entryZone = [price * 0.98, price * 1.02];
    
    // Calculate targets based on support/resistance
    const targets = this.calculateTargets(price, signals);
    
    // Calculate stop loss
    const stopLoss = this.calculateStopLoss(price, signals);
    
    // Calculate position size recommendation
    const positionSize = this.calculatePositionSize(score);

    return {
      action: action,
      urgency: urgency,
      entryZone: entryZone,
      targets: targets,
      stopLoss: stopLoss,
      riskReward: this.calculateRiskReward(price, targets[0]?.price, stopLoss),
      timeframe: this.estimateTimeframe(signals),
      positionSize: positionSize
    };
  }

  /**
   * Setup scheduled scanning
   * @private
   */
  setupScheduledScanning() {
    // Scan every 5 minutes during market hours (9:30 AM - 3:30 PM Cairo time)
    cron.schedule('*/5 9-15 * * 0-4', async () => {
      if (this.isScanning) {
        await this.performScan();
      }
    }, {
      timezone: "Africa/Cairo"
    });

    // Daily cleanup at midnight
    cron.schedule('0 0 * * *', async () => {
      await this.performDailyCleanup();
    }, {
      timezone: "Africa/Cairo"
    });
  }

  /**
   * Helper methods for calculations
   */
  
  calculateSupportResistance(high, low, prices) {
    const recentHigh = Math.max(...high.slice(-20));
    const recentLow = Math.min(...low.slice(-20));
    const avgPrice = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    
    return {
      resistance: recentHigh,
      support: recentLow,
      pivot: avgPrice
    };
  }

  countHigherLows(prices) {
    let count = 0;
    for (let i = 2; i < prices.length; i += 2) {
      if (prices[i] > prices[i - 2]) {
        count++;
      }
    }
    return count;
  }

  detectCandlestickPatterns(prices, high, low) {
    // Simplified candlestick pattern detection
    const last = prices.length - 1;
    const currentCandle = {
      open: prices[last - 1],
      close: prices[last],
      high: high[last],
      low: low[last]
    };

    // Bullish engulfing pattern (simplified)
    if (currentCandle.close > currentCandle.open && 
        currentCandle.close > prices[last - 1] && 
        currentCandle.open < prices[last - 2]) {
      return { bullish: true, pattern: 'bullish_engulfing', strength: 0.8 };
    }

    return { bullish: false, pattern: 'none', strength: 0 };
  }

  detectChartPatterns(prices, volume) {
    // Simplified chart pattern detection
    // This would be much more sophisticated in a real implementation
    const recentPrices = prices.slice(-20);
    const trend = this.calculateTrend(recentPrices);
    
    if (trend > 0.02) {
      return { bullish: true, pattern: 'uptrend', strength: 0.7 };
    }
    
    return { bullish: false, pattern: 'sideways', strength: 0 };
  }

  analyzeWyckoffStage(prices, volume) {
    // Simplified Wyckoff analysis
    const priceVolatility = this.calculateVolatility(prices.slice(-20));
    const volumeAvg = volume.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const recentVolumeAvg = volume.slice(-5).reduce((a, b) => a + b, 0) / 5;
    
    if (recentVolumeAvg > volumeAvg * 1.5 && priceVolatility < 0.05) {
      return { stage: 'accumulation', confidence: 0.7 };
    }
    
    return { stage: 'unknown', confidence: 0 };
  }

  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    return (prices[prices.length - 1] - prices[0]) / prices[0];
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  calculateTargets(price, signals) {
    const resistance = signals.priceAction.details.supportResistance?.resistance || price * 1.1;
    return [
      { level: 1, price: resistance * 1.02, probability: 0.75 },
      { level: 2, price: resistance * 1.08, probability: 0.45 }
    ];
  }

  calculateStopLoss(price, signals) {
    const support = signals.priceAction.details.supportResistance?.support || price * 0.95;
    return support * 0.98;
  }

  calculateRiskReward(entry, target, stopLoss) {
    if (!target || !stopLoss) return 0;
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(target - entry);
    return risk > 0 ? reward / risk : 0;
  }

  calculatePositionSize(score) {
    if (score >= 0.85) return '3-5% of portfolio';
    if (score >= 0.75) return '2-3% of portfolio';
    return '1-2% of portfolio';
  }

  calculateConfidence(signals) {
    const signalCount = Object.values(signals).filter(s => s.score > 0.5).length;
    if (signalCount >= 3) return 'VERY_HIGH';
    if (signalCount >= 2) return 'HIGH';
    if (signalCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  estimateTimeframe(signals) {
    // Based on signal types and strength
    return '2-8 weeks';
  }

  assessRisk(stockData, signals) {
    const volatility = this.calculateVolatility([stockData.price]);
    if (volatility > 0.1) return 'HIGH';
    if (volatility > 0.05) return 'MEDIUM';
    return 'LOW';
  }

  identifyCatalysts(signals, stockData) {
    const catalysts = [];
    
    if (signals.volume.score > 0.7) {
      catalysts.push('High volume accumulation detected');
    }
    
    if (signals.priceAction.details.breakout) {
      catalysts.push('Resistance breakout confirmed');
    }
    
    if (signals.momentum.score > 0.7) {
      catalysts.push('Strong momentum indicators');
    }
    
    return catalysts;
  }

  rankOpportunities(opportunities) {
    return opportunities.sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // Secondary sort by volume
      return (b.signals.volume.score || 0) - (a.signals.volume.score || 0);
    });
  }

  getCompanyName(symbol) {
    const companyNames = {
      'CIB.CA': 'Commercial International Bank',
      'COMI.CA': 'Commercial Bank of Egypt',
      'ETEL.CA': 'Egyptian Telecom',
      'HRHO.CA': 'Hassan Allam Holding',
      'EMFD.CA': 'EGX Medical Fund',
      // Add more mappings as needed
    };
    
    return companyNames[symbol] || symbol.replace('.CA', '');
  }

  getSector(symbol) {
    const sectors = {
      'CIB.CA': 'Banking',
      'COMI.CA': 'Banking',
      'ETEL.CA': 'Telecommunications',
      'HRHO.CA': 'Real Estate',
      // Add more mappings as needed
    };
    
    return sectors[symbol] || 'Unknown';
  }

  async checkForAlerts(opportunities) {
    const highScoreOpportunities = opportunities.filter(op => op.score >= 0.85);
    
    for (const opportunity of highScoreOpportunities) {
      logger.info(`🚨 HIGH SCORE OPPORTUNITY: ${opportunity.symbol} - Score: ${opportunity.score.toFixed(2)}`);
      // Here you would integrate with notification services
    }
  }

  async loadHistoricalPerformance() {
    // Load historical performance data for model improvement
    logger.info('📊 Loading historical performance data...');
  }

  async performDailyCleanup() {
    // Clean up old cache entries and logs
    logger.info('🧹 Performing daily cleanup...');
    await cache.clearPattern('opportunity_hunter:scan:*');
  }

  // Public methods for API
  
  async getLatestOpportunities() {
    const cached = await cache.get('opportunity_hunter:latest_scan');
    if (cached) {
      return cached;
    }
    
    return {
      scanTime: this.lastScanTime,
      opportunities: this.scanResults
    };
  }

  async getOpportunityDetails(symbol) {
    const opportunity = this.scanResults.find(op => op.symbol === symbol);
    if (!opportunity) {
      throw new Error(`Opportunity not found for symbol: ${symbol}`);
    }
    
    return opportunity;
  }

  async forceRescan() {
    logger.info('🔄 Force rescan requested...');
    return await this.performScan();
  }
}

module.exports = OpportunityHunter;
