const { SMA, EMA, RSI, MACD, BollingerBands, Stochastic, ADX } = require('technicalindicators');
const logger = require('../../utils/logger');

/**
 * Momentum Indicators Calculator
 * Calculates RSI, MACD, Stochastic, ADX and other momentum indicators
 */
class MomentumIndicators {
  
  /**
   * Calculate RSI (Relative Strength Index)
   * @param {number[]} prices - Array of closing prices
   * @param {number} period - RSI period (default: 14)
   * @returns {Object} RSI data with current value and signal
   */
  static calculateRSI(prices, period = 14) {
    try {
      if (prices.length < period) {
        throw new Error(`Insufficient data for RSI calculation. Need ${period} periods, got ${prices.length}`);
      }

      const rsiValues = RSI.calculate({
        values: prices,
        period: period
      });

      const currentRSI = rsiValues[rsiValues.length - 1];
      const previousRSI = rsiValues[rsiValues.length - 2];
      
      // Determine signal
      let signal = 'neutral';
      if (currentRSI > 70) {
        signal = 'overbought';
      } else if (currentRSI < 30) {
        signal = 'oversold';
      } else if (currentRSI > 50 && previousRSI <= 50) {
        signal = 'bullish_momentum';
      } else if (currentRSI < 50 && previousRSI >= 50) {
        signal = 'bearish_momentum';
      }

      // Check for divergence (simplified)
      const isDivergent = this.checkRSIDivergence(prices.slice(-10), rsiValues.slice(-10));

      return {
        current: currentRSI,
        previous: previousRSI,
        signal: signal,
        overbought: currentRSI > 70,
        oversold: currentRSI < 30,
        divergence: isDivergent,
        strength: this.calculateRSIStrength(currentRSI),
        values: rsiValues,
        period: period
      };
    } catch (error) {
      logger.error('RSI calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param {number[]} prices - Array of closing prices
   * @param {number} fastPeriod - Fast EMA period (default: 12)
   * @param {number} slowPeriod - Slow EMA period (default: 26)
   * @param {number} signalPeriod - Signal line period (default: 9)
   * @returns {Object} MACD data with histogram and signals
   */
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    try {
      if (prices.length < slowPeriod + signalPeriod) {
        throw new Error(`Insufficient data for MACD calculation. Need ${slowPeriod + signalPeriod} periods`);
      }

      const macdData = MACD.calculate({
        values: prices,
        fastPeriod: fastPeriod,
        slowPeriod: slowPeriod,
        signalPeriod: signalPeriod,
        SimpleMAOscillator: false,
        SimpleMASignal: false
      });

      if (macdData.length === 0) {
        throw new Error('MACD calculation returned no data');
      }

      const current = macdData[macdData.length - 1];
      const previous = macdData[macdData.length - 2];
      
      // Determine signals
      let signal = 'neutral';
      let crossover = 'none';
      
      if (current && previous) {
        // MACD line cross above signal line
        if (current.MACD > current.signal && previous.MACD <= previous.signal) {
          signal = 'bullish_crossover';
          crossover = 'bullish';
        }
        // MACD line cross below signal line
        else if (current.MACD < current.signal && previous.MACD >= previous.signal) {
          signal = 'bearish_crossover';
          crossover = 'bearish';
        }
        // Zero line crossover
        else if (current.MACD > 0 && previous.MACD <= 0) {
          signal = 'bullish_zero_cross';
        }
        else if (current.MACD < 0 && previous.MACD >= 0) {
          signal = 'bearish_zero_cross';
        }
        // Histogram analysis
        else if (current.histogram > 0 && current.histogram > previous.histogram) {
          signal = 'strengthening_bullish';
        }
        else if (current.histogram < 0 && current.histogram < previous.histogram) {
          signal = 'strengthening_bearish';
        }
      }

      const histogramTrend = this.analyzeHistogramTrend(macdData.slice(-5));

      return {
        current: current,
        previous: previous,
        signal: signal,
        crossover: crossover,
        histogramTrend: histogramTrend,
        strength: this.calculateMACDStrength(current, macdData.slice(-10)),
        aboveZero: current.MACD > 0,
        values: macdData,
        fastPeriod: fastPeriod,
        slowPeriod: slowPeriod,
        signalPeriod: signalPeriod
      };
    } catch (error) {
      logger.error('MACD calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate Stochastic Oscillator
   * @param {number[]} high - Array of high prices
   * @param {number[]} low - Array of low prices
   * @param {number[]} close - Array of closing prices
   * @param {number} period - Stochastic period (default: 14)
   * @param {number} signalPeriod - Signal line period (default: 3)
   * @returns {Object} Stochastic data
   */
  static calculateStochastic(high, low, close, period = 14, signalPeriod = 3) {
    try {
      if (high.length < period || low.length < period || close.length < period) {
        throw new Error(`Insufficient data for Stochastic calculation. Need ${period} periods`);
      }

      const stochData = Stochastic.calculate({
        high: high,
        low: low,
        close: close,
        period: period,
        signalPeriod: signalPeriod
      });

      if (stochData.length === 0) {
        throw new Error('Stochastic calculation returned no data');
      }

      const current = stochData[stochData.length - 1];
      const previous = stochData[stochData.length - 2];
      
      // Determine signals
      let signal = 'neutral';
      if (current && previous) {
        if (current.k > current.d && previous.k <= previous.d) {
          signal = 'bullish_crossover';
        } else if (current.k < current.d && previous.k >= previous.d) {
          signal = 'bearish_crossover';
        } else if (current.k < 20 && current.d < 20) {
          signal = 'oversold';
        } else if (current.k > 80 && current.d > 80) {
          signal = 'overbought';
        }
      }

      return {
        current: current,
        previous: previous,
        signal: signal,
        overbought: current.k > 80 && current.d > 80,
        oversold: current.k < 20 && current.d < 20,
        bullishCross: current.k > current.d && previous.k <= previous.d,
        bearishCross: current.k < current.d && previous.k >= previous.d,
        values: stochData,
        period: period,
        signalPeriod: signalPeriod
      };
    } catch (error) {
      logger.error('Stochastic calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate ADX (Average Directional Index)
   * @param {number[]} high - Array of high prices
   * @param {number[]} low - Array of low prices
   * @param {number[]} close - Array of closing prices
   * @param {number} period - ADX period (default: 14)
   * @returns {Object} ADX data with trend strength
   */
  static calculateADX(high, low, close, period = 14) {
    try {
      if (high.length < period + 1 || low.length < period + 1 || close.length < period + 1) {
        throw new Error(`Insufficient data for ADX calculation. Need ${period + 1} periods`);
      }

      const adxData = ADX.calculate({
        high: high,
        low: low,
        close: close,
        period: period
      });

      if (adxData.length === 0) {
        throw new Error('ADX calculation returned no data');
      }

      const current = adxData[adxData.length - 1];
      const previous = adxData[adxData.length - 2];
      
      // Determine trend strength and direction
      let trendStrength = 'weak';
      let trendDirection = 'sideways';
      
      if (current.adx > 25) {
        trendStrength = 'strong';
      } else if (current.adx > 20) {
        trendStrength = 'moderate';
      }
      
      if (current.pdi > current.mdi) {
        trendDirection = 'uptrend';
      } else if (current.mdi > current.pdi) {
        trendDirection = 'downtrend';
      }

      return {
        current: current,
        previous: previous,
        trendStrength: trendStrength,
        trendDirection: trendDirection,
        trending: current.adx > 25,
        strengthening: previous && current.adx > previous.adx,
        values: adxData,
        period: period
      };
    } catch (error) {
      logger.error('ADX calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate momentum (Rate of Change)
   * @param {number[]} prices - Array of closing prices
   * @param {number} period - Momentum period (default: 10)
   * @returns {Object} Momentum data
   */
  static calculateMomentum(prices, period = 10) {
    try {
      if (prices.length < period + 1) {
        throw new Error(`Insufficient data for Momentum calculation. Need ${period + 1} periods`);
      }

      const momentum = [];
      for (let i = period; i < prices.length; i++) {
        const change = ((prices[i] - prices[i - period]) / prices[i - period]) * 100;
        momentum.push(change);
      }

      const current = momentum[momentum.length - 1];
      const previous = momentum[momentum.length - 2];
      
      let signal = 'neutral';
      if (current > 0 && previous <= 0) {
        signal = 'bullish_momentum';
      } else if (current < 0 && previous >= 0) {
        signal = 'bearish_momentum';
      } else if (current > 5) {
        signal = 'strong_bullish';
      } else if (current < -5) {
        signal = 'strong_bearish';
      }

      return {
        current: current,
        previous: previous,
        signal: signal,
        positive: current > 0,
        accelerating: Math.abs(current) > Math.abs(previous),
        values: momentum,
        period: period
      };
    } catch (error) {
      logger.error('Momentum calculation error:', error.message);
      throw error;
    }
  }

  /**
   * Check for RSI divergence (simplified)
   * @private
   */
  static checkRSIDivergence(prices, rsiValues) {
    if (prices.length < 4 || rsiValues.length < 4) return false;
    
    const priceHigh1 = Math.max(...prices.slice(-2));
    const priceHigh2 = Math.max(...prices.slice(-4, -2));
    const rsiHigh1 = Math.max(...rsiValues.slice(-2));
    const rsiHigh2 = Math.max(...rsiValues.slice(-4, -2));
    
    // Bearish divergence: price makes higher high, RSI makes lower high
    if (priceHigh1 > priceHigh2 && rsiHigh1 < rsiHigh2) {
      return 'bearish';
    }
    
    const priceLow1 = Math.min(...prices.slice(-2));
    const priceLow2 = Math.min(...prices.slice(-4, -2));
    const rsiLow1 = Math.min(...rsiValues.slice(-2));
    const rsiLow2 = Math.min(...rsiValues.slice(-4, -2));
    
    // Bullish divergence: price makes lower low, RSI makes higher low
    if (priceLow1 < priceLow2 && rsiLow1 > rsiLow2) {
      return 'bullish';
    }
    
    return false;
  }

  /**
   * Calculate RSI strength rating
   * @private
   */
  static calculateRSIStrength(rsi) {
    if (rsi >= 80) return 'extremely_overbought';
    if (rsi >= 70) return 'overbought';
    if (rsi >= 60) return 'strong_bullish';
    if (rsi >= 50) return 'bullish';
    if (rsi >= 40) return 'bearish';
    if (rsi >= 30) return 'strong_bearish';
    if (rsi >= 20) return 'oversold';
    return 'extremely_oversold';
  }

  /**
   * Calculate MACD strength
   * @private
   */
  static calculateMACDStrength(current, recentData) {
    if (!current || recentData.length < 3) return 'neutral';
    
    const histogramTrend = recentData.slice(-3).map(d => d.histogram);
    const isIncreasing = histogramTrend[2] > histogramTrend[1] && histogramTrend[1] > histogramTrend[0];
    const isDecreasing = histogramTrend[2] < histogramTrend[1] && histogramTrend[1] < histogramTrend[0];
    
    if (current.MACD > current.signal && isIncreasing) return 'strong_bullish';
    if (current.MACD < current.signal && isDecreasing) return 'strong_bearish';
    if (current.MACD > current.signal) return 'bullish';
    if (current.MACD < current.signal) return 'bearish';
    
    return 'neutral';
  }

  /**
   * Analyze histogram trend
   * @private
   */
  static analyzeHistogramTrend(data) {
    if (data.length < 3) return 'insufficient_data';
    
    const histograms = data.map(d => d.histogram);
    let increasing = 0;
    let decreasing = 0;
    
    for (let i = 1; i < histograms.length; i++) {
      if (histograms[i] > histograms[i - 1]) increasing++;
      else if (histograms[i] < histograms[i - 1]) decreasing++;
    }
    
    if (increasing > decreasing) return 'increasing';
    if (decreasing > increasing) return 'decreasing';
    return 'sideways';
  }
}

module.exports = MomentumIndicators;
