// Technical Analysis Service for EGXpilot
// Calculates technical indicators for stock analysis

const sql = require('mssql');
const { connectDatabase } = require('../../config/database');

class TechnicalAnalysisService {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the service
     */
    async initialize() {
        if (!this.initialized) {
            await connectDatabase();
            this.initialized = true;
        }
    }

    /**
     * Calculate Simple Moving Average (SMA)
     */
    calculateSMA(prices, period) {
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(Number((sum / period).toFixed(2)));
        }
        return sma;
    }

    /**
     * Calculate Exponential Moving Average (EMA)
     */
    calculateEMA(prices, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        
        // First EMA is SMA
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += prices[i];
        }
        ema.push(Number((sum / period).toFixed(2)));
        
        // Calculate remaining EMAs
        for (let i = period; i < prices.length; i++) {
            const value = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
            ema.push(Number(value.toFixed(2)));
        }
        
        return ema;
    }

    /**
     * Calculate Relative Strength Index (RSI)
     */
    calculateRSI(prices, period = 14) {
        const rsi = [];
        const gains = [];
        const losses = [];
        
        // Calculate price changes
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        // Calculate RSI
        for (let i = period - 1; i < gains.length; i++) {
            const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            
            if (avgLoss === 0) {
                rsi.push(100);
            } else {
                const rs = avgGain / avgLoss;
                rsi.push(Number((100 - (100 / (1 + rs))).toFixed(2)));
            }
        }
        
        return rsi;
    }

    /**
     * Calculate MACD (Moving Average Convergence Divergence)
     */
    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const emaFast = this.calculateEMA(prices, fastPeriod);
        const emaSlow = this.calculateEMA(prices, slowPeriod);
        
        // MACD line
        const macdLine = [];
        const startIndex = slowPeriod - fastPeriod;
        for (let i = 0; i < emaFast.length - startIndex; i++) {
            macdLine.push(Number((emaFast[i + startIndex] - emaSlow[i]).toFixed(2)));
        }
        
        // Signal line (EMA of MACD)
        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        
        // Histogram
        const histogram = [];
        const signalStartIndex = signalPeriod - 1;
        for (let i = signalStartIndex; i < macdLine.length; i++) {
            histogram.push(Number((macdLine[i] - signalLine[i - signalStartIndex]).toFixed(2)));
        }
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };
    }

    /**
     * Calculate Bollinger Bands
     */
    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        const sma = this.calculateSMA(prices, period);
        const upperBand = [];
        const lowerBand = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const mean = slice.reduce((a, b) => a + b, 0) / period;
            const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            const smaIndex = i - period + 1;
            upperBand.push(Number((sma[smaIndex] + (stdDev * standardDeviation)).toFixed(2)));
            lowerBand.push(Number((sma[smaIndex] - (stdDev * standardDeviation)).toFixed(2)));
        }
        
        return {
            middle: sma,
            upper: upperBand,
            lower: lowerBand
        };
    }

    /**
     * Calculate all technical indicators for a stock
     */
    async calculateStockIndicators(stockId, symbol) {
        await this.initialize();
        
        try {
            // Get stock price data
            const result = await sql.query`
                SELECT 
                    date,
                    close_price,
                    high_price,
                    low_price,
                    volume
                FROM StockData
                WHERE stock_id = ${stockId}
                ORDER BY date ASC
            `;
            
            const data = result.recordset;
            if (data.length < 50) {
                throw new Error(`Insufficient data for ${symbol}: ${data.length} records`);
            }
            
            const prices = data.map(d => d.close_price);
            const dates = data.map(d => d.date);
            
            // Calculate indicators
            const sma20 = this.calculateSMA(prices, 20);
            const sma50 = this.calculateSMA(prices, 50);
            const ema12 = this.calculateEMA(prices, 12);
            const ema26 = this.calculateEMA(prices, 26);
            const rsi = this.calculateRSI(prices);
            const macd = this.calculateMACD(prices);
            const bollinger = this.calculateBollingerBands(prices);
            
            // Prepare data for insertion
            const technicalData = [];
            const minLength = Math.min(
                sma20.length,
                sma50.length,
                rsi.length,
                bollinger.middle.length
            );
            
            for (let i = 0; i < minLength; i++) {
                const dateIndex = dates.length - minLength + i;
                
                technicalData.push({
                    stock_id: stockId,
                    date: dates[dateIndex],
                    sma_20: sma20[i] || null,
                    sma_50: sma50[i] || null,
                    ema_12: ema12[ema12.length - minLength + i] || null,
                    ema_26: ema26[ema26.length - minLength + i] || null,
                    rsi: rsi[rsi.length - minLength + i] || null,
                    macd: macd.macd[macd.macd.length - minLength + i] || null,
                    macd_signal: macd.signal[macd.signal.length - minLength + i] || null,
                    bollinger_upper: bollinger.upper[i] || null,
                    bollinger_middle: bollinger.middle[i] || null,
                    bollinger_lower: bollinger.lower[i] || null,
                    created_at: new Date()
                });
            }
            
            // Insert technical analysis data
            await this.insertTechnicalDataBatch(technicalData);
            
            return {
                success: true,
                symbol,
                calculations: technicalData.length
            };
            
        } catch (error) {
            console.error(`Error calculating indicators for ${symbol}:`, error.message);
            return {
                success: false,
                symbol,
                error: error.message
            };
        }
    }

    /**
     * Insert technical analysis data in batches
     */
    async insertTechnicalDataBatch(technicalData) {
        try {
            // Clear existing technical analysis for this stock
            if (technicalData.length > 0) {
                await sql.query`DELETE FROM TechnicalAnalysis WHERE stock_id = ${technicalData[0].stock_id}`;
            }
            
            // Insert new data
            for (const data of technicalData) {
                await sql.query`
                    INSERT INTO TechnicalAnalysis (
                        stock_id, date, sma_20, sma_50, ema_12, ema_26,
                        rsi, macd, macd_signal, bollinger_upper, 
                        bollinger_middle, bollinger_lower, created_at
                    ) VALUES (
                        ${data.stock_id}, ${data.date}, ${data.sma_20}, ${data.sma_50},
                        ${data.ema_12}, ${data.ema_26}, ${data.rsi}, ${data.macd},
                        ${data.macd_signal}, ${data.bollinger_upper}, ${data.bollinger_middle},
                        ${data.bollinger_lower}, ${data.created_at}
                    )
                `;
            }
        } catch (error) {
            console.error('Error inserting technical data batch:', error.message);
            throw error;
        }
    }

    /**
     * Calculate technical analysis for all stocks
     */
    async calculateAllTechnicalAnalysis() {
        await this.initialize();
        
        try {
            // Get all stocks with price data
            const result = await sql.query`
                SELECT DISTINCT s.id, s.symbol, s.name
                FROM Stocks s
                INNER JOIN StockData sd ON s.id = sd.stock_id
                GROUP BY s.id, s.symbol, s.name
                HAVING COUNT(sd.id) >= 50
                ORDER BY s.symbol
            `;
            
            const stocks = result.recordset;
            console.log(`\n📈 Calculating technical analysis for ${stocks.length} stocks...`);
            
            const stats = {
                totalStocks: stocks.length,
                successfulStocks: 0,
                failedStocks: [],
                totalCalculations: 0
            };
            
            // Process stocks sequentially
            for (let i = 0; i < stocks.length; i++) {
                const stock = stocks[i];
                
                // Show progress
                const percentage = Math.round(((i + 1) / stocks.length) * 100);
                process.stdout.write(`\r🔧 Analyzing: ${stock.symbol} (${i + 1}/${stocks.length}) ${percentage}%`);
                
                const result = await this.calculateStockIndicators(stock.id, stock.symbol);
                
                if (result.success) {
                    stats.successfulStocks++;
                    stats.totalCalculations += result.calculations;
                } else {
                    stats.failedStocks.push(stock.symbol);
                }
                
                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log(); // New line after progress
            return stats;
            
        } catch (error) {
            console.error('Error calculating all technical analysis:', error.message);
            throw error;
        }
    }

    /**
     * Get technical analysis for a stock
     */
    async getTechnicalAnalysis(stockId, days = 100) {
        await this.initialize();
        
        try {
            const result = await sql.query`
                SELECT TOP ${days}
                    date,
                    sma_20,
                    sma_50,
                    ema_12,
                    ema_26,
                    rsi,
                    macd,
                    macd_signal,
                    bollinger_upper,
                    bollinger_middle,
                    bollinger_lower
                FROM TechnicalAnalysis
                WHERE stock_id = ${stockId}
                ORDER BY date DESC
            `;
            
            return result.recordset.reverse(); // Return chronological order
            
        } catch (error) {
            console.error(`Error getting technical analysis for ${stockId}:`, error.message);
            throw error;
        }
    }
}

module.exports = TechnicalAnalysisService;
