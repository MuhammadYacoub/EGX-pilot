# Project Title: EGXPILOT – Smart Financial Advisor for the Egyptian Stock Market

## 🗂 Table of Contents
- [🔰 Objective](#-objective)
- [🧩 Tech Stack](#-tech-stack)
- [📂 Project Structure (Targeted Output)](#-project-structure-targeted-output)
- [🔧 Features to Build](#-features-to-build)
- [📊 Data Sources & Integration](#-data-sources--integration)
- [🚀 Performance Requirements](#-performance-requirements)
- [⚖️ Risk Management & Compliance](#️-risk-management--compliance)
- [📌 Future Extensions](#-future-extensions)
- [🧠 Copilot Guidelines](#-copilot-guidelines)
- [✅ Output Examples](#-output-examples)

## 🔰 Objective
Build an intelligent trading assistant focused on the Egyptian Stock Exchange (EGX). The assistant provides reliable, data-driven buy/sell recommendations based on technical analysis, financial fundamentals, and advanced market theories (Wyckoff, Elliott Wave, Candlestick patterns). The system should reduce cognitive load for traders, adapt to different user risk profiles, and ensure compliance with Egyptian financial regulations.

## 🧩 Tech Stack
- **Backend**: Node.js (Express) with clustering for high availability
- **Database**: SQL Server (with Docker support) + Redis for caching
- **Frontend**: ReactJS / Next.js (Phase 1), React Native or Flutter (Future)
- **Real-time Data**: WebSockets for live price feeds
- **Analysis Tools**:
  - `ta-lib` or `technicalindicators` for classic TA
  - Custom Wyckoff/Elliott modules
  - Candlestick auto-recognition
  - Smart averaging & intraday S/R engine
- **Infrastructure**: Docker, PM2, Nginx for reverse proxy
- **Monitoring**: Winston for logging, Health check endpoints

## 📂 Project Structure (Targeted Output)
```
EGXPILOT/
│
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── stocks.js
│   │   │   ├── analysis.js
│   │   │   ├── portfolio.js
│   │   │   ├── alerts.js
│   │   │   ├── backtest.js
│   │   │   └── opportunities.js  // Opportunity hunter endpoints
│   │   └── middleware/
│   │       ├── auth.js
│   │       ├── rateLimit.js
│   │       └── validation.js
│   ├── services/
│   │   ├── dataProvider.js
│   │   ├── analysisEngine.js
│   │   ├── riskEngine.js
│   │   ├── alertsService.js
│   │   ├── backtestService.js
│   │   └── opportunityHunter.js  // Main opportunity hunting service
│   ├── models/
│   │   ├── Stock.js
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   ├── Alert.js
│   │   └── AnalysisCache.js
│   ├── smart-analysis/
│   │   ├── indicators/
│   │   │   ├── momentum.js      // RSI, MACD, Stochastic
│   │   │   ├── trend.js         // EMA, SMA, Bollinger
│   │   │   ├── volume.js        // OBV, Volume Profile
│   │   │   └── volatility.js    // ATR, Standard Deviation
│   │   ├── patterns/
│   │   │   ├── candlestick.js
│   │   │   ├── chartPatterns.js // Head & Shoulders, Triangles
│   │   │   └── wyckoffStages.js
│   │   ├── strategies/
│   │   │   ├── smartAveraging.js
│   │   │   ├── elliottWave.js
│   │   │   └── breakoutStrategy.js
│   │   ├── opportunity-hunter/
│   │   │   ├── scannerEngine.js     // Main opportunity scanner
│   │   │   ├── signalAggregator.js  // Combine multiple signals
│   │   │   ├── momentumDetector.js  // Strong momentum detection
│   │   │   ├── breakoutScanner.js   // Breakout opportunities
│   │   │   ├── volumeAnalyzer.js    // Volume surge analysis
│   │   │   ├── priceActionScanner.js // Price action patterns
│   │   │   └── opportunityScorer.js // Score and rank opportunities
│   │   └── risk/
│   │       ├── positionSizing.js
│   │       ├── riskCalculator.js
│   │       └── diversification.js
│   ├── data/
│   │   ├── collectors/
│   │   │   ├── yahooCollector.js
│   │   │   ├── egxCollector.js
│   │   │   └── newsCollector.js
│   │   ├── validators/
│   │   │   ├── priceValidator.js
│   │   │   └── volumeValidator.js
│   │   └── cache/
│   │       ├── redisClient.js
│   │       └── cacheManager.js
│   └── utils/
│       ├── logger.js
│       ├── dateHelper.js
│       └── mathHelper.js
│
├── database/
│   ├── schema/
│   │   ├── 01_users.sql
│   │   ├── 02_stocks.sql
│   │   ├── 03_historical_data.sql
│   │   ├── 04_portfolios.sql
│   │   ├── 05_alerts.sql
│   │   ├── 06_analysis_cache.sql
│   │   ├── 07_market_sessions.sql
│   │   └── 08_opportunities_log.sql  // Log discovered opportunities
│   ├── migrations/
│   ├── seeds/
│   │   └── egx_stocks.sql
│   └── procedures/
│       ├── get_stock_history.sql
│       └── calculate_portfolio_performance.sql
│
├── frontend/
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── analysis.js
│   │   ├── portfolio.js
│   │   └── backtest.js
│   ├── components/
│   │   ├── TradingDashboard/
│   │   ├── StockAnalyzer/
│   │   ├── PortfolioTracker/
│   │   ├── RiskCalculator/
│   │   ├── AlertsManager/
│   │   ├── BacktestResults/
│   │   └── OpportunityHunter/    // Opportunity scanner dashboard
│   ├── hooks/
│   │   ├── useWebSocket.js
│   │   ├── useAnalysis.js
│   │   └── usePortfolio.js
│   └── styles/
│
├── config/
│   ├── database.js
│   ├── redis.js
│   ├── dataSources.js
│   └── environment.js
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── COMPLIANCE_NOTES.md
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
└── scripts/
    ├── deploy.sh
    ├── backup.sh
    └── data_migration.sh
```

## 🔧 Features to Build

### **Phase 1: Core Analysis Engine**
1. **Data Collection & Validation**:
   ```javascript
   // Multi-source data collection with validation
   const dataCollector = {
     sources: ['yahoo', 'egx_official', 'investing_com'],
     validation: {
       priceChange: 0.2,    // Max 20% change validation
       volumeSpike: 10,     // Max 10x volume spike validation
       dataFreshness: 300   // Max 5 minutes old data
     }
   };
   ```

2. **Smart Analysis Unit**:
   - **Technical Indicators**: RSI, MACD, EMA, Bollinger, Fibonacci, ATR
   - **Pattern Recognition**: Candlestick patterns with confidence scoring
   - **Wyckoff Analysis**: Stage detection (accumulation, markup, distribution, markdown)
   - **Elliott Wave Theory**: 5/3-wave cycle identification
   - **Volume Analysis**: OBV, Volume Profile, Volume-Price Trend

3. **Risk Management Engine**:
   ```javascript
   const riskEngine = {
     positionSizing: (capital, riskPercent, entry, stopLoss) => {
       const riskAmount = capital * (riskPercent / 100);
       const riskPerShare = Math.abs(entry - stopLoss);
       return Math.floor(riskAmount / riskPerShare);
     },
     
     portfolioDiversification: (portfolio, newStock) => {
       // Check sector concentration
       // Check correlation with existing positions
       // Validate max single position size
     },
     
     marketConditions: () => {
       // Bull/Bear market detection
       // Volatility assessment
       // Market sentiment scoring
     }
   };
   ```

### **Phase 2: User Interface & Portfolio Management**
1. **User Input Wizard**:
   - Investment budget (10,000 - 1,000,000 EGP)
   - Profit target (percentage and timeline)
   - Risk tolerance (Conservative/Moderate/Aggressive/Speculative)
   - Investment horizon (Day/Swing/Position/Long-term)
   - Sector preferences and exclusions

2. **Portfolio Tracking**:
   - Real-time P&L calculation
   - Performance analytics and benchmarking
   - Risk metrics (Sharpe ratio, max drawdown, win rate)
   - Trade journal with entry/exit reasons

3. **Alert System**:
   ```javascript
   const alertTypes = {
     PRICE_TARGET: 'Price reached target/stop loss',
     TECHNICAL_SIGNAL: 'New buy/sell signal generated',
     RISK_WARNING: 'Portfolio risk threshold exceeded',
     NEWS_SENTIMENT: 'Significant news impact detected',
     MARKET_CONDITIONS: 'Major market condition change'
   };
   ```

### **Phase 3: Advanced Features**
1. **Backtesting Engine**:
   ```javascript
   const backtestConfig = {
     strategy: 'wyckoff_accumulation',
     timeframe: '1D',
     period: { start: '2020-01-01', end: '2023-12-31' },
     initialCapital: 100000,
     commission: 0.001,
     slippage: 0.001
   };
   ```

2. **Smart Averaging Strategy**:
   - Dynamic support/resistance calculation
   - Intraday entry/exit optimization
   - Position scaling based on conviction levels

## 🎯 **Opportunity Hunter - Advanced Market Scanner**

### **Core Scanning Algorithm**:
```javascript
/**
 * Main Opportunity Hunter Engine
 * Scans all EGX stocks for high-probability bullish opportunities
 */
const opportunityHunter = {
  // Scanning configuration
  scanConfig: {
    minVolume: 100000,           // Minimum daily volume
    minPrice: 1.0,               // Minimum stock price (EGP)
    maxPrice: 1000.0,            // Maximum stock price (EGP)
    minMarketCap: 50000000,      // Minimum market cap (50M EGP)
    excludeSectors: ['REITS'],   // Excluded sectors
    scanInterval: 300000,        // 5 minutes scan interval
    maxResults: 20               // Top 20 opportunities
  },

  // Signal detection criteria
  signalCriteria: {
    // Momentum Signals
    momentum: {
      rsi: { oversold: 30, bullishDivergence: true },
      macd: { bullishCrossover: true, histogram: 'positive' },
      stochastic: { oversold: 20, bullishCross: true },
      adx: { trending: 25, direction: 'up' },
      weight: 0.25
    },

    // Volume Signals
    volume: {
      volumeSpike: 2.0,           // 2x average volume
      priceVolumeConfirmation: true,
      onBalanceVolume: 'bullish',
      volumeProfile: 'accumulation',
      weight: 0.20
    },

    // Price Action Signals
    priceAction: {
      breakoutLevel: true,        // Breaking resistance
      supportHold: true,          // Holding key support
      higherLows: 3,             // Minimum 3 higher lows
      consolidation: 'bullish',   // Bullish consolidation
      weight: 0.25
    },

    // Pattern Signals
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
  },

  // Advanced filters
  qualityFilters: {
    // Fundamental filters
    fundamentals: {
      debtToEquity: 2.0,         // Max debt ratio
      currentRatio: 1.0,         // Min liquidity
      roe: 0.05,                 // Min 5% ROE
      revenueGrowth: 0.0         // Min revenue growth
    },

    // Technical filters
    technical: {
      trendStrength: 0.6,        // Min trend strength
      volatility: { min: 0.15, max: 0.50 }, // Volatility range
      momentum: 0.5,             // Min momentum score
      liquidity: 50000           // Min daily turnover
    },

    // Risk filters
    risk: {
      maxDrawdown: 0.30,         // Max 30% drawdown in 6 months
      betaRange: { min: 0.5, max: 2.0 },
      correlationLimit: 0.7      // Max correlation with market
    }
  }
};
```

### **Signal Aggregation & Scoring**:
```javascript
/**
 * Aggregates multiple signals into a comprehensive opportunity score
 * @param {Object} stockData - Complete stock data with indicators
 * @returns {Object} Opportunity analysis with score and details
 */
const aggregateSignals = async (stockData) => {
  const signals = {
    momentum: await analyzeMomentum(stockData),
    volume: await analyzeVolume(stockData),
    priceAction: await analyzePriceAction(stockData),
    patterns: await analyzePatterns(stockData)
  };

  // Calculate weighted score
  const opportunityScore = (
    signals.momentum.score * 0.25 +
    signals.volume.score * 0.20 +
    signals.priceAction.score * 0.25 +
    signals.patterns.score * 0.30
  );

  return {
    symbol: stockData.symbol,
    score: opportunityScore,
    confidence: calculateConfidence(signals),
    signals: signals,
    recommendation: generateRecommendation(signals, opportunityScore),
    timeframe: estimateTimeframe(signals),
    riskLevel: assessRisk(stockData, signals)
  };
};

/**
 * Advanced momentum detection with multiple timeframes
 */
const analyzeMomentum = async (stockData) => {
  const { prices, volume, indicators } = stockData;
  
  const momentumSignals = {
    // Short-term momentum (5-15 days)
    shortTerm: {
      rsi: indicators.rsi < 35 && indicators.rsi > 25, // Oversold but not extreme
      macd: indicators.macd.signal === 'bullish_crossover',
      stochastic: indicators.stochastic.k < 30 && indicators.stochastic.d < 30,
      priceRate: (prices.current / prices.ma5) > 1.02 // 2% above 5-day MA
    },

    // Medium-term momentum (20-50 days)
    mediumTerm: {
      ema: prices.current > indicators.ema20 && indicators.ema20 > indicators.ema50,
      adx: indicators.adx > 25 && indicators.diPlus > indicators.diMinus,
      momentum: indicators.momentum > 0,
      volumeConfirmation: volume.current > volume.ma20 * 1.5
    },

    // Long-term momentum (50+ days)
    longTerm: {
      trend: indicators.ema50 > indicators.ema200,
      slope: calculateSlope(indicators.ema50, 10) > 0,
      support: prices.current > indicators.ema200,
      strength: indicators.rsi > 50
    }
  };

  return {
    score: calculateMomentumScore(momentumSignals),
    details: momentumSignals,
    strength: assessMomentumStrength(momentumSignals),
    sustainability: assessSustainability(momentumSignals)
  };
};

/**
 * Volume analysis for institutional activity detection
 */
const analyzeVolume = async (stockData) => {
  const { volume, prices } = stockData;
  
  const volumeAnalysis = {
    // Volume surge detection
    surge: {
      current: volume.current / volume.ma20,
      sustained: volume.ma5 / volume.ma20,
      breakout: volume.current > volume.ma50 * 2,
      accumulation: detectAccumulation(volume, prices, 20)
    },

    // Price-volume relationship
    priceVolume: {
      upVolume: calculateUpVolume(prices, volume, 10),
      downVolume: calculateDownVolume(prices, volume, 10),
      volumePrice: volume.current * prices.current,
      efficiency: calculateVolumeEfficiency(prices, volume)
    },

    // Institutional activity
    institutional: {
      largeBlocks: detectLargeBlockTrading(volume),
      flowDirection: calculateMoneyFlow(prices, volume),
      accumulation: detectInstitutionalAccumulation(volume, prices),
      distribution: detectDistribution(volume, prices)
    }
  };

  return {
    score: calculateVolumeScore(volumeAnalysis),
    details: volumeAnalysis,
    institutionalActivity: volumeAnalysis.institutional,
    signal: determineVolumeSignal(volumeAnalysis)
  };
};

/**
 * Advanced pattern recognition with confidence scoring
 */
const analyzePatterns = async (stockData) => {
  const patterns = {
    // Candlestick patterns
    candlestick: await detectCandlestickPatterns(stockData.ohlc),
    
    // Chart patterns
    chart: await detectChartPatterns(stockData.prices, stockData.volume),
    
    // Wyckoff analysis
    wyckoff: await analyzeWyckoffStage(stockData),
    
    // Elliott Wave
    elliott: await detectElliottWavePattern(stockData.prices),
    
    // Custom patterns
    custom: await detectCustomPatterns(stockData)
  };

  return {
    score: calculatePatternScore(patterns),
    details: patterns,
    highestConfidence: findHighestConfidencePattern(patterns),
    convergence: analyzePatternConvergence(patterns)
  };
};
```

### **Real-time Opportunity Dashboard**:
```javascript
/**
 * Real-time opportunity monitoring and alerting
 */
const opportunityMonitor = {
  // Continuous scanning
  startScanning: async () => {
    setInterval(async () => {
      try {
        const opportunities = await scanMarketOpportunities();
        const topOpportunities = rankOpportunities(opportunities);
        
        // Alert for new high-score opportunities
        await checkForNewOpportunities(topOpportunities);
        
        // Update dashboard
        await updateOpportunityDashboard(topOpportunities);
        
        // Log for analysis
        await logOpportunities(topOpportunities);
        
      } catch (error) {
        logger.error('Opportunity scanning failed:', error);
      }
    }, 300000); // Every 5 minutes
  },

  // Alert system for hot opportunities
  alertSystem: {
    criteria: {
      minScore: 0.80,           // Minimum 80% score
      newOpportunity: true,     // Only new opportunities
      volumeConfirmation: true, // Must have volume confirmation
      multiSignal: 3           // At least 3 different signal types
    },

    notifications: {
      email: true,
      sms: true,
      websocket: true,
      mobile: true
    }
  },

  // Historical tracking
  trackPerformance: async (opportunities) => {
    // Track how discovered opportunities performed
    // Use for model improvement
    // Generate success rate reports
  }
};
```

### **Primary Data Sources**:
1. **Yahoo Finance API**: Real-time and historical data for EGX stocks
2. **Investing.com**: Alternative data source for validation
3. **EGX Official Website**: Scraping for official announcements
4. **Egyptian Exchange API**: If available, integrate for official data

### **Data Validation Pipeline**:
```javascript
const dataValidator = {
  validatePrice: (currentPrice, previousPrice, symbol) => {
    const changePercent = Math.abs((currentPrice - previousPrice) / previousPrice);
    if (changePercent > 0.2) {
      logger.warn(`Suspicious price change for ${symbol}: ${changePercent}%`);
      return false;
    }
    return true;
  },
  
  validateVolume: (currentVolume, averageVolume, symbol) => {
    if (currentVolume <= 0 || currentVolume > (averageVolume * 15)) {
      logger.warn(`Invalid volume for ${symbol}: ${currentVolume}`);
      return false;
    }
    return true;
  },
  
  crossValidate: async (symbol, price) => {
    // Compare price across multiple sources
    // Flag discrepancies > 1%
    // Use weighted average if sources disagree
  }
};
```

### **Caching Strategy**:
```javascript
const cacheConfig = {
  realTimeData: { ttl: 60 },      // 1 minute for live prices
  technicalAnalysis: { ttl: 300 }, // 5 minutes for TA results
  historicalData: { ttl: 86400 },  // 24 hours for historical data
  newsData: { ttl: 1800 }          // 30 minutes for news
};
```

## 🚀 Performance Requirements
- **Response Time**: Sub-2s for analysis generation
- **Data Freshness**: Max 5-minute delay for real-time data
- **Uptime**: 99.5% availability during market hours
- **Concurrent Users**: Support 100+ simultaneous users
- **Database**: Optimized queries with proper indexing
- **Caching**: Multi-layer caching (Redis + in-memory)
- **Error Handling**: Graceful degradation when data sources fail

## ⚖️ Risk Management & Compliance

### **Risk Controls**:
```javascript
const riskControls = {
  maxPositionSize: 0.1,        // Max 10% of portfolio per stock
  maxSectorExposure: 0.3,      // Max 30% in any sector
  maxDailyRisk: 0.02,          // Max 2% portfolio risk per day
  stopLossRequired: true,       // Mandatory stop loss for all positions
  correlationLimit: 0.7        // Avoid highly correlated positions
};
```

### **Compliance Features**:
- **Disclaimer**: Clear investment risk warnings
- **Data Privacy**: GDPR-compliant user data handling
- **Audit Trail**: Complete trade and analysis logging
- **Regulatory**: Compliance with Egyptian Financial Regulatory Authority

### **Legal Safeguards**:
```javascript
const disclaimerText = {
  ar: "هذا النظام يوفر تحليلات فنية فقط وليس نصائح استثمارية. التداول ينطوي على مخاطر خسارة رأس المال.",
  en: "This system provides technical analysis only, not investment advice. Trading involves risk of capital loss."
};
```

## 📌 Future Extensions
- **Market Sentiment Analysis**: Social media and news sentiment scoring
- **AI-Powered Predictions**: Machine learning models for price forecasting
- **Options Analysis**: Support for options and derivatives
- **Mobile App**: React Native app with push notifications
- **WhatsApp Bot**: Trade alerts via WhatsApp Business API
- **API Marketplace**: Allow third-party integrations

## 🧠 Copilot Guidelines

### **Code Quality Standards**:
- Use async/await syntax consistently
- Implement proper error handling with try-catch blocks
- Add comprehensive JSDoc comments for all functions
- Follow ESLint configuration for consistent formatting
- Separate business logic from API routes
- Use TypeScript interfaces for data structures

### **Function Documentation Template**:
```javascript
/**
 * Calculates RSI (Relative Strength Index) for technical analysis
 * @param {number[]} prices - Array of closing prices (minimum 14 values)
 * @param {number} period - RSI period (default: 14)
 * @returns {Promise<number>} RSI value between 0-100
 * @throws {Error} If insufficient data or invalid period
 * @example
 * const rsi = await calculateRSI([100, 102, 98, 105, 103], 14);
 * console.log(`RSI: ${rsi.toFixed(2)}`); // RSI: 65.43
 */
async function calculateRSI(prices, period = 14) {
  // Implementation here
}
```

### **Database Query Patterns**:
```javascript
// Use parameterized queries to prevent SQL injection
const getStockHistory = async (symbol, days) => {
  const query = `
    SELECT TOP (@days) 
      date, open_price, high_price, low_price, close_price, volume
    FROM historical_data 
    WHERE symbol = @symbol 
    ORDER BY date DESC
  `;
  
  return await db.query(query, { symbol, days });
};
```

### **Error Handling Pattern**:
```javascript
const analyzeStock = async (symbol) => {
  try {
    const data = await dataService.getStockData(symbol);
    const analysis = await analysisEngine.analyze(data);
    
    // Cache successful analysis
    await cache.set(`analysis_${symbol}`, analysis, 300);
    
    return {
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Analysis failed for ${symbol}:`, error);
    
    // Try to return cached analysis if available
    const cachedAnalysis = await cache.get(`analysis_${symbol}`);
    if (cachedAnalysis) {
      return {
        success: true,
        data: cachedAnalysis,
        cached: true,
        warning: 'Using cached data due to analysis error'
      };
    }
    
    throw new AnalysisError(`Unable to analyze ${symbol}`, error);
  }
};
```

### **Configuration Management**:
```javascript
// config/environment.js
const config = {
  development: {
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 1433,
      database: process.env.DB_NAME || 'egxpilot_dev'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    dataSources: {
      yahoo: { enabled: true, priority: 1 },
      investing: { enabled: true, priority: 2 }
    }
  },
  production: {
    // Production configuration
  }
};
```

## ✅ Output Examples

### **Enhanced Stock Recommendation**:
```json
{
  "analysis": {
    "symbol": "COMI.CA",
    "timestamp": "2025-06-11T10:30:00Z",
    "marketPrice": 50.00,
    "dataQuality": "excellent",
    "sourceValidation": {
      "yahoo": 50.00,
      "investing": 49.98,
      "consensus": 50.00
    }
  },
  "recommendation": {
    "action": "BUY",
    "conviction": "HIGH",
    "entryZone": {
      "optimal": 49.50,
      "acceptable": [49.20, 50.30]
    },
    "targets": [
      { "level": 1, "price": 55.00, "probability": 0.75 },
      { "level": 2, "price": 58.00, "probability": 0.45 }
    ],
    "stopLoss": {
      "initial": 47.50,
      "trailingStop": true,
      "riskReward": 3.5
    },
    "positionSizing": {
      "conservative": "1.5% of portfolio",
      "moderate": "2.5% of portfolio",
      "aggressive": "4.0% of portfolio"
    },
    "timeframe": "2-6 weeks",
    "marketConditions": "favorable"
  },
  "technicalAnalysis": {
    "indicators": {
      "rsi": { "value": 35.6, "signal": "oversold", "weight": 0.25 },
      "macd": { "signal": "bullish_crossover", "strength": 0.8, "weight": 0.20 },
      "bollinger": { "position": "lower_band", "squeeze": false, "weight": 0.15 },
      "volume": { "profile": "accumulation", "spike": 1.8, "weight": 0.15 }
    },
    "patterns": {
      "candlestick": {
        "name": "bullish_engulfing",
        "reliability": 0.75,
        "weight": 0.25
      },
      "wyckoff": {
        "stage": "accumulation_phase_b",
        "confidence": 0.85,
        "weight": 0.35
      },
      "chartPattern": {
        "name": "ascending_triangle",
        "completion": 0.80,
        "weight": 0.20
      }
    }
  },
  "confidence": {
    "overall": 0.85,
    "breakdown": {
      "technical": 0.82,
      "fundamental": 0.78,
      "market_sentiment": 0.70,
      "volume_confirmation": 0.88
    }
  },
  "risks": [
    {
      "type": "market_risk",
      "description": "General market volatility",
      "probability": 0.3,
      "impact": "medium"
    },
    {
      "type": "sector_risk",
      "description": "Banking sector regulatory changes",
      "probability": 0.2,
      "impact": "high"
    }
  ],
  "backtestResults": {
    "strategy": "wyckoff_accumulation",
    "period": "2020-2024",
    "winRate": 0.68,
    "avgReturn": 0.12,
    "maxDrawdown": 0.08,
    "sharpeRatio": 1.45
  }
}
```

### **🎯 Opportunity Hunter Results**:
```json
{
  "opportunityHunter": {
    "scanTime": "2025-06-11T14:30:00Z",
    "totalScanned": 235,
    "qualified": 45,
    "topOpportunities": 12,
    "marketConditions": {
      "trend": "bullish",
      "volatility": "moderate",
      "volume": "above_average",
      "sentiment": "positive"
    }
  },
  "hotOpportunities": [
    {
      "rank": 1,
      "symbol": "HRHO.CA",
      "companyName": "Hassan Allam Holding",
      "sector": "Real Estate",
      "currentPrice": 15.20,
      "opportunityScore": 0.92,
      "confidence": "VERY_HIGH",
      "discoveryTime": "2025-06-11T14:25:00Z",
      
      "signals": {
        "momentum": {
          "score": 0.88,
          "rsi": { "value": 32, "signal": "oversold_recovery" },
          "macd": { "signal": "bullish_crossover", "strength": 0.9 },
          "adx": { "value": 28, "trend": "strengthening" }
        },
        "volume": {
          "score": 0.95,
          "spike": 3.2,
          "sustainedVolume": 2.1,
          "institutionalActivity": "heavy_accumulation",
          "moneyFlow": "strongly_positive"
        },
        "priceAction": {
          "score": 0.90,
          "breakout": "resistance_broken",
          "level": 15.00,
          "consolidation": "bullish_flag",
          "support": "strong_at_14.50"
        },
        "patterns": {
          "score": 0.94,
          "primary": {
            "type": "cup_and_handle",
            "completion": 0.95,
            "target": 18.50
          },
          "secondary": {
            "type": "bullish_engulfing",
            "reliability": 0.85
          },
          "wyckoff": {
            "stage": "markup_phase_a",
            "confidence": 0.88
          }
        }
      },
      
      "recommendation": {
        "action": "STRONG_BUY",
        "urgency": "HIGH",
        "entryZone": [15.10, 15.30],
        "targets": [
          { "level": 1, "price": 17.50, "probability": 0.85 },
          { "level": 2, "price": 18.50, "probability": 0.65 },
          { "level": 3, "price": 20.00, "probability": 0.40 }
        ],
        "stopLoss": 14.20,
        "riskReward": 4.2,
        "timeframe": "2-8 weeks",
        "positionSize": "3-5% of portfolio"
      },
      
      "catalysts": [
        "Major resistance breakout with volume",
        "Institutional accumulation pattern",
        "Sector rotation into real estate",
        "Technical pattern completion"
      ],
      
      "fundamentals": {
        "marketCap": "2.5B EGP",
        "pe": 12.5,
        "roe": 0.18,
        "debtRatio": 0.45,
        "revenueGrowth": 0.25
      }
    },
    
    {
      "rank": 2,
      "symbol": "EGTS.CA",
      "companyName": "Egyptian Transport Services",
      "sector": "Transportation",
      "currentPrice": 2.85,
      "opportunityScore": 0.87,
      "confidence": "HIGH",
      
      "signals": {
        "momentum": {
          "score": 0.82,
          "rsi": { "value": 28, "signal": "deeply_oversold_recovery" },
          "stochastic": { "signal": "bullish_crossover" }
        },
        "volume": {
          "score": 0.89,
          "spike": 2.8,
          "accumulation": "detected",
          "smartMoney": "buying"
        },
        "patterns": {
          "score": 0.90,
          "primary": {
            "type": "wyckoff_spring",
            "confidence": 0.92,
            "target": 3.50
          }
        }
      },
      
      "recommendation": {
        "action": "BUY",
        "urgency": "MEDIUM",
        "entryZone": [2.80, 2.90],
        "targets": [
          { "level": 1, "price": 3.20, "probability": 0.75 },
          { "level": 2, "price": 3.50, "probability": 0.55 }
        ],
        "stopLoss": 2.60,
        "riskReward": 2.8,
        "timeframe": "3-6 weeks"
      }
    }
  ],
  
  "scannerMetrics": {
    "averageScore": 0.65,
    "highScoreCount": 12,
    "sectorDistribution": {
      "Real Estate": 3,
      "Banking": 2,
      "Industrial": 4,
      "Transportation": 2,
      "Telecom": 1
    },
    "signalTypes": {
      "breakout": 8,
      "oversold_recovery": 5,
      "wyckoff_accumulation": 7,
      "volume_surge": 12
    }
  },
  
  "alerts": [
    {
      "type": "HOT_OPPORTUNITY",
      "symbol": "HRHO.CA",
      "message": "Exceptional opportunity detected with 0.92 score",
      "priority": "URGENT",
      "action": "immediate_review_recommended"
    }
  ]
}
```

### **🔥 Opportunity Alert Notification**:
```json
{
  "alert": {
    "type": "GOLDEN_OPPORTUNITY",
    "timestamp": "2025-06-11T14:30:15Z",
    "symbol": "HRHO.CA",
    "title": "🚀 فرصة ذهبية مكتشفة!",
    "message": {
      "ar": "تم اكتشاف فرصة استثنائية في سهم حسن علام هولدنج (HRHO) بدرجة ثقة 92%. السهم كسر مقاومة مهمة مع حجم تداول ضخم وإشارات تراكم مؤسسي قوية.",
      "en": "Exceptional opportunity detected in Hassan Allam Holding (HRHO) with 92% confidence. Stock broke major resistance with massive volume and strong institutional accumulation signals."
    },
    "keyPoints": [
      "🎯 النتيجة: 0.92/1.00 (استثنائية)",
      "📈 كسر مقاومة عند 15.00 جنيه",
      "📊 حجم تداول 3.2 ضعف المتوسط",
      "🏦 تراكم مؤسسي قوي",
      "📐 نموذج الكوب والمقبض مكتمل 95%"
    ],
    "recommendation": {
      "action": "شراء قوي",
      "entry": "15.10 - 15.30 جنيه",
      "target": "17.50 - 18.50 جنيه",
      "stopLoss": "14.20 جنيه",
      "timeframe": "2-8 أسابيع"
    },
    "urgency": "HIGH",
    "expiresIn": "2 hours"
  }
}
```": true,
      "riskReward": 3.5
    },
    "positionSizing": {
      "conservative": "1.5% of portfolio",
      "moderate": "2.5% of portfolio",
      "aggressive": "4.0% of portfolio"
    },
    "timeframe": "2-6 weeks",
    "marketConditions": "favorable"
  },
  "technicalAnalysis": {
    "indicators": {
      "rsi": { "value": 35.6, "signal": "oversold", "weight": 0.25 },
      "macd": { "signal": "bullish_crossover", "strength": 0.8, "weight": 0.20 },
      "bollinger": { "position": "lower_band", "squeeze": false, "weight": 0.15 },
      "volume": { "profile": "accumulation", "spike": 1.8, "weight": 0.15 }
    },
    "patterns": {
      "candlestick": {
        "name": "bullish_engulfing",
        "reliability": 0.75,
        "weight": 0.25
      },
      "wyckoff": {
        "stage": "accumulation_phase_b",
        "confidence": 0.85,
        "weight": 0.35
      },
      "chartPattern": {
        "name": "ascending_triangle",
        "completion": 0.80,
        "weight": 0.20
      }
    }
  },
  "confidence": {
    "overall": 0.85,
    "breakdown": {
      "technical": 0.82,
      "fundamental": 0.78,
      "market_sentiment": 0.70,
      "volume_confirmation": 0.88
    }
  },
  "risks": [
    {
      "type": "market_risk",
      "description": "General market volatility",
      "probability": 0.3,
      "impact": "medium"
    },
    {
      "type": "sector_risk",
      "description": "Banking sector regulatory changes",
      "probability": 0.2,
      "impact": "high"
    }
  ],
  "backtestResults": {
    "strategy": "wyckoff_accumulation",
    "period": "2020-2024",
    "winRate": 0.68,
    "avgReturn": 0.12,
    "maxDrawdown": 0.08,
    "sharpeRatio": 1.45
  }
}
```

### **Portfolio Analysis Response**:
```json
{
  "portfolio": {
    "totalValue": 150000,
    "cash": 25000,
    "invested": 125000,
    "todaysPnL": 2500,
    "totalReturn": 0.15,
    "riskMetrics": {
      "beta": 1.2,
      "sharpeRatio": 1.3,
      "maxDrawdown": 0.12,
      "volatility": 0.18
    }
  },
  "positions": [
    {
      "symbol": "COMI.CA",
      "quantity": 1000,
      "avgCost": 45.00,
      "currentPrice": 50.00,
      "unrealizedPnL": 5000,
      "weight": 0.33,
      "recommendation": "HOLD"
    }
  ],
  "alerts": [
    {
      "type": "RISK_WARNING",
      "message": "Portfolio concentration in banking sector exceeds 40%",
      "severity": "medium",
      "action": "Consider diversification"
    }
  ]
}
```

### **Backtest Results**:
```json
{
  "backtest": {
    "strategy": "smart_averaging_wyckoff",
    "period": {
      "start": "2020-01-01",
      "end": "2024-12-31"
    },
    "initialCapital": 100000,
    "finalValue": 185000,
    "totalReturn": 0.85,
    "annualizedReturn": 0.17,
    "metrics": {
      "totalTrades": 156,
      "winningTrades": 98,
      "winRate": 0.628,
      "avgWin": 0.08,
      "avgLoss": -0.04,
      "profitFactor": 2.1,
      "maxDrawdown": 0.15,
      "sharpeRatio": 1.42,
      "calmarRatio": 1.13
    },
    "yearlyReturns": [
      { "year": 2020, "return": 0.12 },
      { "year": 2021, "return": 0.25 },
      { "year": 2022, "return": -0.08 },
      { "year": 2023, "return": 0.19 },
      { "year": 2024, "return": 0.15 }
    ]
  }
}
```

---

## ✳️ Implementation Priority

### **Sprint 1 (Foundation)**:
1. Database schema and models
2. Basic data collection from Yahoo Finance
3. Core technical indicators (RSI, MACD, EMA)
4. Simple buy/sell recommendation logic

### **Sprint 2 (Analysis Engine)**:
1. Advanced pattern recognition
2. Wyckoff analysis implementation
3. Risk management engine
4. Caching layer with Redis

### **Sprint 3 (User Interface)**:
1. React dashboard with real-time updates
2. Portfolio tracking functionality
3. Alert system implementation
4. Backtesting interface

### **Sprint 4 (Production Ready)**:
1. Performance optimization
2. Error handling and monitoring
3. Security implementation
4. Documentation and deployment

---

**Final Note**: This enhanced prompt provides a comprehensive roadmap for building a production-ready Egyptian stock market analysis system. Focus on data quality, risk management, and user experience. Always prioritize compliance with local financial regulations and implement proper disclaimers.