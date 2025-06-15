/**
 * Backtesting Engine Service
 * Simulates trading strategies against historical data to evaluate performance
 */

const db = require('../../config/database');
const logger = require('../utils/logger');
const redis = require('../../config/redis');
const yahooCollector = require('../data/collectors/yahooCollector');
const momentumIndicators = require('../smart-analysis/indicators/momentum');

class BacktestingService {
    constructor() {
        this.cachePrefix = 'backtest:';
        this.cacheTTL = 3600; // 1 hour
    }

    /**
     * Create and run a new backtest
     */
    async createBacktest(userId, backtestConfig) {
        try {
            const {
                strategyName,
                symbols,
                startDate,
                endDate,
                initialCapital,
                strategy,
                parameters = {}
            } = backtestConfig;

            // Validate date range
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start >= end) {
                throw new Error('Start date must be before end date');
            }

            if (end > new Date()) {
                throw new Error('End date cannot be in the future');
            }

            // Create backtest record
            const backtestId = require('crypto').randomUUID();
            const insertQuery = `
                INSERT INTO backtest_runs (
                    id, user_id, strategy_name, strategy_config, start_date, end_date, 
                    initial_capital, status
                )
                VALUES (
                    @backtestId, @userId, @strategyName, @strategyConfig, @startDate, @endDate,
                    @initialCapital, 'pending'
                )
            `;

            await db.query(insertQuery, {
                backtestId,
                userId,
                strategyName,
                strategyConfig: JSON.stringify({ strategy, parameters, symbols }),
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                initialCapital
            });

            // Start backtest execution asynchronously
            this.executeBacktest(backtestId, {
                symbols,
                startDate: start,
                endDate: end,
                initialCapital,
                strategy,
                parameters
            }).catch(error => {
                logger.error(`Backtest execution failed for ${backtestId}:`, error);
                this.updateBacktestStatus(backtestId, 'failed', { error: error.message });
            });

            return {
                success: true,
                data: { backtestId },
                message: 'Backtest created and execution started'
            };
        } catch (error) {
            logger.error('Error creating backtest:', error);
            throw new Error(error.message || 'Failed to create backtest');
        }
    }

    /**
     * Execute backtest simulation
     */
    async executeBacktest(backtestId, config) {
        try {
            logger.info(`Starting backtest execution: ${backtestId}`);
            
            await this.updateBacktestStatus(backtestId, 'running');

            const { symbols, startDate, endDate, initialCapital, strategy, parameters } = config;
            
            // Initialize portfolio state
            const portfolio = {
                cash: initialCapital,
                positions: new Map(),
                totalValue: initialCapital,
                trades: [],
                dailyValues: []
            };

            // Get historical data for all symbols
            const historicalData = await this.getHistoricalDataForBacktest(symbols, startDate, endDate);
            
            if (!historicalData || Object.keys(historicalData).length === 0) {
                throw new Error('No historical data available for the specified period');
            }

            // Generate trading dates
            const tradingDates = this.generateTradingDates(startDate, endDate);
            
            // Execute strategy for each trading day
            for (const currentDate of tradingDates) {
                await this.processTradingDay(backtestId, portfolio, currentDate, historicalData, strategy, parameters);
                
                // Calculate daily portfolio value
                const dailyValue = this.calculatePortfolioValue(portfolio, currentDate, historicalData);
                portfolio.dailyValues.push({
                    date: currentDate,
                    value: dailyValue,
                    cash: portfolio.cash,
                    positions: this.getPositionsSnapshot(portfolio.positions, currentDate, historicalData)
                });
            }

            // Calculate final metrics
            const results = this.calculateBacktestMetrics(portfolio, initialCapital, tradingDates);
            
            // Save results to database
            await this.saveBacktestResults(backtestId, portfolio, results);

            logger.info(`Backtest completed: ${backtestId}`);
            
        } catch (error) {
            logger.error(`Backtest execution error for ${backtestId}:`, error);
            await this.updateBacktestStatus(backtestId, 'failed', { error: error.message });
            throw error;
        }
    }

    /**
     * Process a single trading day
     */
    async processTradingDay(backtestId, portfolio, currentDate, historicalData, strategy, parameters) {
        try {
            // Get signals for current date based on strategy
            const signals = await this.generateSignals(currentDate, historicalData, strategy, parameters);
            
            // Execute trades based on signals
            for (const signal of signals) {
                await this.executeBacktestTrade(backtestId, portfolio, signal, currentDate, historicalData);
            }
            
        } catch (error) {
            logger.error(`Error processing trading day ${currentDate}:`, error);
        }
    }

    /**
     * Generate trading signals based on strategy
     */
    async generateSignals(currentDate, historicalData, strategy, parameters) {
        const signals = [];
        
        try {
            switch (strategy) {
                case 'momentum_rsi':
                    return this.generateMomentumRSISignals(currentDate, historicalData, parameters);
                
                case 'mean_reversion':
                    return this.generateMeanReversionSignals(currentDate, historicalData, parameters);
                
                case 'breakout':
                    return this.generateBreakoutSignals(currentDate, historicalData, parameters);
                
                case 'buy_and_hold':
                    return this.generateBuyAndHoldSignals(currentDate, historicalData, parameters);
                
                default:
                    logger.warn(`Unknown strategy: ${strategy}`);
                    return [];
            }
        } catch (error) {
            logger.error(`Error generating signals for strategy ${strategy}:`, error);
            return [];
        }
    }

    /**
     * Momentum RSI Strategy
     */
    generateMomentumRSISignals(currentDate, historicalData, parameters) {
        const signals = [];
        const { rsiPeriod = 14, oversoldLevel = 30, overboughtLevel = 70 } = parameters;
        
        for (const [symbol, data] of Object.entries(historicalData)) {
            try {
                const dateIndex = data.findIndex(d => new Date(d.date).toDateString() === currentDate.toDateString());
                if (dateIndex < rsiPeriod) continue; // Not enough data for RSI
                
                const priceData = data.slice(0, dateIndex + 1);
                const rsi = momentumIndicators.calculateRSI(priceData.map(d => d.close), rsiPeriod);
                const currentRSI = rsi[rsi.length - 1];
                
                if (currentRSI < oversoldLevel) {
                    signals.push({
                        symbol,
                        action: 'buy',
                        price: priceData[priceData.length - 1].close,
                        reason: `RSI oversold: ${currentRSI.toFixed(2)}`,
                        confidence: (oversoldLevel - currentRSI) / oversoldLevel
                    });
                } else if (currentRSI > overboughtLevel) {
                    signals.push({
                        symbol,
                        action: 'sell',
                        price: priceData[priceData.length - 1].close,
                        reason: `RSI overbought: ${currentRSI.toFixed(2)}`,
                        confidence: (currentRSI - overboughtLevel) / (100 - overboughtLevel)
                    });
                }
            } catch (error) {
                logger.error(`Error calculating RSI for ${symbol}:`, error);
            }
        }
        
        return signals;
    }

    /**
     * Mean Reversion Strategy
     */
    generateMeanReversionSignals(currentDate, historicalData, parameters) {
        const signals = [];
        const { lookbackPeriod = 20, deviationThreshold = 2 } = parameters;
        
        for (const [symbol, data] of Object.entries(historicalData)) {
            try {
                const dateIndex = data.findIndex(d => new Date(d.date).toDateString() === currentDate.toDateString());
                if (dateIndex < lookbackPeriod) continue;
                
                const priceData = data.slice(dateIndex - lookbackPeriod + 1, dateIndex + 1);
                const prices = priceData.map(d => d.close);
                const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
                const stdDev = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length);
                
                const currentPrice = prices[prices.length - 1];
                const zScore = (currentPrice - mean) / stdDev;
                
                if (zScore < -deviationThreshold) {
                    signals.push({
                        symbol,
                        action: 'buy',
                        price: currentPrice,
                        reason: `Mean reversion buy: Z-score ${zScore.toFixed(2)}`,
                        confidence: Math.abs(zScore) / deviationThreshold
                    });
                } else if (zScore > deviationThreshold) {
                    signals.push({
                        symbol,
                        action: 'sell',
                        price: currentPrice,
                        reason: `Mean reversion sell: Z-score ${zScore.toFixed(2)}`,
                        confidence: Math.abs(zScore) / deviationThreshold
                    });
                }
            } catch (error) {
                logger.error(`Error calculating mean reversion for ${symbol}:`, error);
            }
        }
        
        return signals;
    }

    /**
     * Breakout Strategy
     */
    generateBreakoutSignals(currentDate, historicalData, parameters) {
        const signals = [];
        const { lookbackPeriod = 20, volumeMultiplier = 1.5 } = parameters;
        
        for (const [symbol, data] of Object.entries(historicalData)) {
            try {
                const dateIndex = data.findIndex(d => new Date(d.date).toDateString() === currentDate.toDateString());
                if (dateIndex < lookbackPeriod) continue;
                
                const priceData = data.slice(dateIndex - lookbackPeriod + 1, dateIndex + 1);
                const currentData = priceData[priceData.length - 1];
                const previousData = priceData.slice(0, -1);
                
                const highestHigh = Math.max(...previousData.map(d => d.high));
                const lowestLow = Math.min(...previousData.map(d => d.low));
                const avgVolume = previousData.reduce((sum, d) => sum + d.volume, 0) / previousData.length;
                
                const isVolumeBreakout = currentData.volume > avgVolume * volumeMultiplier;
                
                if (currentData.close > highestHigh && isVolumeBreakout) {
                    signals.push({
                        symbol,
                        action: 'buy',
                        price: currentData.close,
                        reason: `Upward breakout: ${currentData.close} > ${highestHigh}`,
                        confidence: Math.min(1, (currentData.close - highestHigh) / highestHigh)
                    });
                } else if (currentData.close < lowestLow && isVolumeBreakout) {
                    signals.push({
                        symbol,
                        action: 'sell',
                        price: currentData.close,
                        reason: `Downward breakout: ${currentData.close} < ${lowestLow}`,
                        confidence: Math.min(1, (lowestLow - currentData.close) / lowestLow)
                    });
                }
            } catch (error) {
                logger.error(`Error calculating breakout for ${symbol}:`, error);
            }
        }
        
        return signals;
    }

    /**
     * Buy and Hold Strategy
     */
    generateBuyAndHoldSignals(currentDate, historicalData, parameters) {
        const signals = [];
        const { investmentPerSymbol = 10000 } = parameters;
        
        // Only buy on the first day
        const firstDate = Object.values(historicalData)[0]?.[0]?.date;
        if (!firstDate || new Date(firstDate).toDateString() !== currentDate.toDateString()) {
            return signals;
        }
        
        for (const [symbol, data] of Object.entries(historicalData)) {
            if (data.length > 0) {
                signals.push({
                    symbol,
                    action: 'buy',
                    price: data[0].close,
                    quantity: Math.floor(investmentPerSymbol / data[0].close),
                    reason: 'Buy and hold initial purchase',
                    confidence: 1.0
                });
            }
        }
        
        return signals;
    }

    /**
     * Execute a backtest trade
     */
    async executeBacktestTrade(backtestId, portfolio, signal, currentDate, historicalData) {
        try {
            const { symbol, action, price, quantity: signalQuantity, reason, confidence } = signal;
            const commission = 0.001; // 0.1% commission
            
            // Calculate position size if not specified
            let quantity = signalQuantity;
            if (!quantity) {
                if (action === 'buy') {
                    const positionValue = portfolio.cash * 0.1; // 10% of cash per position
                    quantity = Math.floor(positionValue / price);
                } else if (action === 'sell') {
                    const currentPosition = portfolio.positions.get(symbol) || 0;
                    quantity = Math.floor(currentPosition * 0.5); // Sell 50% of position
                }
            }
            
            if (quantity <= 0) return;
            
            const tradeValue = quantity * price;
            const commissionCost = tradeValue * commission;
            
            if (action === 'buy') {
                const totalCost = tradeValue + commissionCost;
                if (portfolio.cash < totalCost) return; // Insufficient funds
                
                portfolio.cash -= totalCost;
                const currentPosition = portfolio.positions.get(symbol) || 0;
                portfolio.positions.set(symbol, currentPosition + quantity);
                
            } else if (action === 'sell') {
                const currentPosition = portfolio.positions.get(symbol) || 0;
                if (currentPosition < quantity) return; // Insufficient shares
                
                const proceeds = tradeValue - commissionCost;
                portfolio.cash += proceeds;
                portfolio.positions.set(symbol, currentPosition - quantity);
                
                if (portfolio.positions.get(symbol) <= 0) {
                    portfolio.positions.delete(symbol);
                }
            }
            
            // Record trade
            const trade = {
                symbol,
                action,
                quantity,
                price,
                date: currentDate,
                reason,
                confidence,
                commission: commissionCost,
                portfolioValue: this.calculatePortfolioValue(portfolio, currentDate, historicalData)
            };
            
            portfolio.trades.push(trade);
            
            // Save trade to database
            await this.saveBacktestTrade(backtestId, trade);
            
        } catch (error) {
            logger.error('Error executing backtest trade:', error);
        }
    }

    /**
     * Calculate current portfolio value
     */
    calculatePortfolioValue(portfolio, currentDate, historicalData) {
        let totalValue = portfolio.cash;
        
        for (const [symbol, quantity] of portfolio.positions) {
            const symbolData = historicalData[symbol];
            if (symbolData) {
                const dateIndex = symbolData.findIndex(d => 
                    new Date(d.date).toDateString() === currentDate.toDateString()
                );
                
                if (dateIndex >= 0) {
                    const currentPrice = symbolData[dateIndex].close;
                    totalValue += quantity * currentPrice;
                }
            }
        }
        
        return totalValue;
    }

    /**
     * Calculate backtest performance metrics
     */
    calculateBacktestMetrics(portfolio, initialCapital, tradingDates) {
        const finalValue = portfolio.dailyValues[portfolio.dailyValues.length - 1]?.value || initialCapital;
        const totalReturn = (finalValue - initialCapital) / initialCapital * 100;
        
        // Calculate annualized return
        const daysDiff = Math.max(1, (tradingDates[tradingDates.length - 1] - tradingDates[0]) / (1000 * 60 * 60 * 24));
        const annualizedReturn = Math.pow(finalValue / initialCapital, 365 / daysDiff) - 1;
        
        // Calculate maximum drawdown
        let maxValue = initialCapital;
        let maxDrawdown = 0;
        
        for (const dailyValue of portfolio.dailyValues) {
            maxValue = Math.max(maxValue, dailyValue.value);
            const drawdown = (maxValue - dailyValue.value) / maxValue;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        }
        
        // Calculate Sharpe ratio (simplified, assuming risk-free rate = 0)
        const dailyReturns = [];
        for (let i = 1; i < portfolio.dailyValues.length; i++) {
            const prevValue = portfolio.dailyValues[i - 1].value;
            const currentValue = portfolio.dailyValues[i].value;
            dailyReturns.push((currentValue - prevValue) / prevValue);
        }
        
        const avgDailyReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
        const stdDev = Math.sqrt(dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgDailyReturn, 2), 0) / dailyReturns.length);
        const sharpeRatio = stdDev > 0 ? (avgDailyReturn * Math.sqrt(252)) / (stdDev * Math.sqrt(252)) : 0;
        
        // Trade statistics
        const totalTrades = portfolio.trades.length;
        const winningTrades = portfolio.trades.filter(trade => {
            // This is simplified - would need to track P&L per trade properly
            return trade.action === 'sell'; // Assume sells are wins for now
        }).length;
        const losingTrades = totalTrades - winningTrades;
        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
        
        return {
            finalValue,
            totalReturn,
            annualizedReturn: annualizedReturn * 100,
            maxDrawdown: maxDrawdown * 100,
            sharpeRatio,
            totalTrades,
            winningTrades,
            losingTrades,
            winRate
        };
    }

    /**
     * Get historical data for backtest
     */
    async getHistoricalDataForBacktest(symbols, startDate, endDate) {
        const historicalData = {};
        
        for (const symbol of symbols) {
            try {
                // Try to get from database first
                const dbData = await this.getHistoricalDataFromDB(symbol, startDate, endDate);
                
                if (dbData && dbData.length > 0) {
                    historicalData[symbol] = dbData;
                } else {
                    // Fall back to Yahoo Finance API
                    const yahooData = await yahooCollector.getHistoricalData(symbol, {
                        period1: Math.floor(startDate.getTime() / 1000),
                        period2: Math.floor(endDate.getTime() / 1000),
                        interval: '1d'
                    });
                    
                    if (yahooData && yahooData.length > 0) {
                        historicalData[symbol] = yahooData.map(d => ({
                            date: d.date,
                            open: d.open,
                            high: d.high,
                            low: d.low,
                            close: d.close,
                            volume: d.volume
                        }));
                    }
                }
            } catch (error) {
                logger.error(`Error getting historical data for ${symbol}:`, error);
            }
        }
        
        return historicalData;
    }

    /**
     * Get historical data from database
     */
    async getHistoricalDataFromDB(symbol, startDate, endDate) {
        try {
            const query = `
                SELECT price_date as date, open_price as open, high_price as high, 
                       low_price as low, close_price as close, volume
                FROM stock_prices 
                WHERE symbol = @symbol 
                AND price_date >= @startDate 
                AND price_date <= @endDate
                ORDER BY price_date ASC
            `;
            
            return await db.query(query, {
                symbol,
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            });
        } catch (error) {
            logger.error(`Error querying historical data for ${symbol}:`, error);
            return [];
        }
    }

    /**
     * Generate trading dates (excluding weekends)
     */
    generateTradingDates(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
                dates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }

    /**
     * Get positions snapshot
     */
    getPositionsSnapshot(positions, currentDate, historicalData) {
        const snapshot = {};
        
        for (const [symbol, quantity] of positions) {
            const symbolData = historicalData[symbol];
            if (symbolData) {
                const dateIndex = symbolData.findIndex(d => 
                    new Date(d.date).toDateString() === currentDate.toDateString()
                );
                
                if (dateIndex >= 0) {
                    const currentPrice = symbolData[dateIndex].close;
                    snapshot[symbol] = {
                        quantity,
                        price: currentPrice,
                        value: quantity * currentPrice
                    };
                }
            }
        }
        
        return snapshot;
    }

    /**
     * Update backtest status
     */
    async updateBacktestStatus(backtestId, status, additionalData = {}) {
        try {
            const updateQuery = `
                UPDATE backtest_runs 
                SET status = @status, 
                    ${status === 'completed' ? 'completed_at = GETUTCDATE(),' : ''}
                    ${additionalData.error ? 'results_data = @resultsData' : ''}
                WHERE id = @backtestId
            `;
            
            const params = { backtestId, status };
            if (additionalData.error) {
                params.resultsData = JSON.stringify({ error: additionalData.error });
            }
            
            await db.query(updateQuery, params);
        } catch (error) {
            logger.error('Error updating backtest status:', error);
        }
    }

    /**
     * Save backtest results
     */
    async saveBacktestResults(backtestId, portfolio, metrics) {
        try {
            const updateQuery = `
                UPDATE backtest_runs SET
                    final_value = @finalValue,
                    total_return = @totalReturn,
                    annual_return = @annualReturn,
                    max_drawdown = @maxDrawdown,
                    sharpe_ratio = @sharpeRatio,
                    total_trades = @totalTrades,
                    winning_trades = @winningTrades,
                    losing_trades = @losingTrades,
                    win_rate = @winRate,
                    avg_win = @avgWin,
                    avg_loss = @avgLoss,
                    results_data = @resultsData,
                    status = 'completed',
                    completed_at = GETUTCDATE()
                WHERE id = @backtestId
            `;
            
            // Calculate average win/loss (simplified)
            const avgWin = metrics.winningTrades > 0 ? metrics.totalReturn / metrics.winningTrades : 0;
            const avgLoss = metrics.losingTrades > 0 ? -metrics.totalReturn / metrics.losingTrades : 0;
            
            const resultsData = {
                dailyValues: portfolio.dailyValues,
                trades: portfolio.trades,
                finalPositions: Object.fromEntries(portfolio.positions),
                metrics
            };
            
            await db.query(updateQuery, {
                backtestId,
                finalValue: metrics.finalValue,
                totalReturn: metrics.totalReturn,
                annualReturn: metrics.annualizedReturn,
                maxDrawdown: metrics.maxDrawdown,
                sharpeRatio: metrics.sharpeRatio,
                totalTrades: metrics.totalTrades,
                winningTrades: metrics.winningTrades,
                losingTrades: metrics.losingTrades,
                winRate: metrics.winRate,
                avgWin,
                avgLoss,
                resultsData: JSON.stringify(resultsData)
            });
            
            logger.info(`Backtest results saved: ${backtestId}`);
        } catch (error) {
            logger.error('Error saving backtest results:', error);
        }
    }

    /**
     * Save individual backtest trade
     */
    async saveBacktestTrade(backtestId, trade) {
        try {
            const insertQuery = `
                INSERT INTO backtest_trades (
                    id, backtest_id, symbol, trade_type, quantity, price, 
                    trade_date, signal_reason, portfolio_value
                )
                VALUES (
                    @tradeId, @backtestId, @symbol, @tradeType, @quantity, @price,
                    @tradeDate, @signalReason, @portfolioValue
                )
            `;
            
            await db.query(insertQuery, {
                tradeId: require('crypto').randomUUID(),
                backtestId,
                symbol: trade.symbol,
                tradeType: trade.action,
                quantity: trade.quantity,
                price: trade.price,
                tradeDate: trade.date.toISOString(),
                signalReason: trade.reason,
                portfolioValue: trade.portfolioValue
            });
        } catch (error) {
            logger.error('Error saving backtest trade:', error);
        }
    }

    /**
     * Get backtest results
     */
    async getBacktestResults(backtestId, userId) {
        try {
            const query = `
                SELECT * FROM backtest_runs 
                WHERE id = @backtestId AND user_id = @userId
            `;
            
            const results = await db.query(query, { backtestId, userId });
            
            if (!results.length) {
                throw new Error('Backtest not found or access denied');
            }
            
            const backtest = results[0];
            
            // Parse results data
            if (backtest.results_data) {
                backtest.results_data = JSON.parse(backtest.results_data);
            }
            
            // Parse strategy config
            if (backtest.strategy_config) {
                backtest.strategy_config = JSON.parse(backtest.strategy_config);
            }
            
            return {
                success: true,
                data: backtest
            };
        } catch (error) {
            logger.error('Error getting backtest results:', error);
            throw new Error(error.message || 'Failed to get backtest results');
        }
    }

    /**
     * Get user's backtest history
     */
    async getUserBacktests(userId, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT 
                    id, strategy_name, start_date, end_date, initial_capital,
                    final_value, total_return, annual_return, max_drawdown,
                    sharpe_ratio, total_trades, win_rate, status,
                    created_at, completed_at
                FROM backtest_runs 
                WHERE user_id = @userId
                ORDER BY created_at DESC
                OFFSET @offset ROWS
                FETCH NEXT @limit ROWS ONLY
            `;
            
            const countQuery = `
                SELECT COUNT(*) as total FROM backtest_runs WHERE user_id = @userId
            `;
            
            const [backtests, countResult] = await Promise.all([
                db.query(query, { userId, offset, limit }),
                db.query(countQuery, { userId })
            ]);
            
            const total = countResult[0]?.total || 0;
            const totalPages = Math.ceil(total / limit);
            
            return {
                success: true,
                data: {
                    backtests,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    }
                }
            };
        } catch (error) {
            logger.error('Error getting user backtests:', error);
            throw new Error('Failed to get backtest history');
        }
    }

    /**
     * Delete backtest
     */
    async deleteBacktest(backtestId, userId) {
        try {
            const deleteQuery = `
                DELETE FROM backtest_runs 
                WHERE id = @backtestId AND user_id = @userId
            `;
            
            const result = await db.execute(deleteQuery, { backtestId, userId });
            
            if (result.rowsAffected === 0) {
                throw new Error('Backtest not found or access denied');
            }
            
            return {
                success: true,
                message: 'Backtest deleted successfully'
            };
        } catch (error) {
            logger.error('Error deleting backtest:', error);
            throw new Error(error.message || 'Failed to delete backtest');
        }
    }
}

module.exports = new BacktestingService();
