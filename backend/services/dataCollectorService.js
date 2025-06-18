// Data Collector Service for EGXpilot
// Responsible for collecting and generating stock price data

const sql = require('mssql');
const { connectDatabase } = require('../../config/database');

class DataCollectorService {
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
     * Generate realistic stock price data
     */
    generatePriceData(previousClose, volatility = 0.02, trend = 0.0001) {
        // Use random walk with drift for realistic price movement
        const change = (Math.random() - 0.5) * volatility + trend;
        const newPrice = previousClose * (1 + change);
        
        // Ensure price doesn't go negative
        return Math.max(newPrice, 0.01);
    }

    /**
     * Generate OHLC data from price movements
     */
    generateOHLC(open, volatility = 0.015) {
        const high = open * (1 + Math.random() * volatility);
        const low = open * (1 - Math.random() * volatility);
        const close = low + Math.random() * (high - low);
        
        return {
            open: Number(open.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            close: Number(close.toFixed(2))
        };
    }

    /**
     * Generate volume based on price movement
     */
    generateVolume(priceChange, baseVolume = 50000) {
        // Higher volume on bigger price changes
        const volumeMultiplier = 1 + Math.abs(priceChange) * 5;
        const randomFactor = 0.5 + Math.random();
        
        return Math.round(baseVolume * volumeMultiplier * randomFactor);
    }

    /**
     * Collect data for a single stock
     */
    async collectStockData(stockId, symbol, days = 365) {
        await this.initialize();
        
        try {
            // Get stock base price (random between 10-200 EGP)
            let currentPrice = 10 + Math.random() * 190;
            const baseVolume = 10000 + Math.random() * 90000;
            
            const dataPoints = [];
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            for (let i = 0; i < days; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                
                // Skip weekends
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    continue;
                }
                
                // Generate OHLC data
                const ohlc = this.generateOHLC(currentPrice);
                const priceChange = (ohlc.close - ohlc.open) / ohlc.open;
                const volume = this.generateVolume(priceChange, baseVolume);
                
                dataPoints.push({
                    stock_id: stockId,
                    date: currentDate.toISOString().split('T')[0],
                    open_price: ohlc.open,
                    high_price: ohlc.high,
                    low_price: ohlc.low,
                    close_price: ohlc.close,
                    volume: volume,
                    created_at: new Date()
                });
                
                // Update current price for next day
                currentPrice = this.generatePriceData(ohlc.close);
            }
            
            // Insert data in batches
            await this.insertStockDataBatch(dataPoints);
            
            return {
                success: true,
                symbol,
                dataPoints: dataPoints.length
            };
            
        } catch (error) {
            console.error(`Error collecting data for ${symbol}:`, error.message);
            return {
                success: false,
                symbol,
                error: error.message
            };
        }
    }

    /**
     * Insert stock data in batches for better performance
     */
    async insertStockDataBatch(dataPoints) {
        try {
            // Clear existing data for this stock first
            if (dataPoints.length > 0) {
                await sql.query`DELETE FROM StockData WHERE stock_id = ${dataPoints[0].stock_id}`;
            }
            
            // Insert new data in batches
            const batchSize = 50;
            for (let i = 0; i < dataPoints.length; i += batchSize) {
                const batch = dataPoints.slice(i, i + batchSize);
                
                for (const point of batch) {
                    await sql.query`
                        INSERT INTO StockData (
                            stock_id, date, open_price, high_price, low_price, 
                            close_price, volume, created_at
                        ) VALUES (
                            ${point.stock_id}, ${point.date}, ${point.open_price}, 
                            ${point.high_price}, ${point.low_price}, ${point.close_price}, 
                            ${point.volume}, ${point.created_at}
                        )
                    `;
                }
            }
        } catch (error) {
            console.error('Error inserting stock data batch:', error.message);
            throw error;
        }
    }

    /**
     * Collect data for all stocks
     */
    async collectAllStocksData(days = 365) {
        await this.initialize();
        
        try {
            // Get all stocks
            const result = await sql.query`SELECT id, symbol, name FROM Stocks ORDER BY symbol`;
            const stocks = result.recordset;
            
            console.log(`\n📊 Collecting data for ${stocks.length} stocks over ${days} days...`);
            
            const stats = {
                totalStocks: stocks.length,
                successfulStocks: 0,
                failedStocks: [],
                totalDataPoints: 0
            };
            
            // Process stocks sequentially to avoid database overload
            for (let i = 0; i < stocks.length; i++) {
                const stock = stocks[i];
                
                // Show progress
                const percentage = Math.round(((i + 1) / stocks.length) * 100);
                process.stdout.write(`\r📈 Processing: ${stock.symbol} (${i + 1}/${stocks.length}) ${percentage}%`);
                
                const result = await this.collectStockData(stock.id, stock.symbol, days);
                
                if (result.success) {
                    stats.successfulStocks++;
                    stats.totalDataPoints += result.dataPoints;
                } else {
                    stats.failedStocks.push(stock.symbol);
                }
                
                // Small delay to avoid overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            console.log(); // New line after progress
            return stats;
            
        } catch (error) {
            console.error('Error collecting all stocks data:', error.message);
            throw error;
        }
    }

    /**
     * Update latest data for all stocks
     */
    async updateLatestData(days = 30) {
        await this.initialize();
        
        try {
            const result = await sql.query`SELECT id, symbol FROM Stocks`;
            const stocks = result.recordset;
            
            let successfulStocks = 0;
            let newDataPoints = 0;
            
            for (const stock of stocks) {
                try {
                    const dataResult = await this.collectStockData(stock.id, stock.symbol, days);
                    
                    if (dataResult.success) {
                        successfulStocks++;
                        newDataPoints += dataResult.dataPoints;
                    }
                    
                } catch (error) {
                    console.error(`Error updating ${stock.symbol}:`, error.message);
                }
            }
            
            return {
                successfulStocks,
                newDataPoints,
                totalStocks: stocks.length
            };
            
        } catch (error) {
            console.error('Error updating latest data:', error.message);
            throw error;
        }
    }

    /**
     * Get stock data for analysis
     */
    async getStockData(stockId, days = 100) {
        await this.initialize();
        
        try {
            const result = await sql.query`
                SELECT TOP ${days}
                    date,
                    open_price,
                    high_price,
                    low_price,
                    close_price,
                    volume
                FROM StockData
                WHERE stock_id = ${stockId}
                ORDER BY date DESC
            `;
            
            return result.recordset.reverse(); // Return chronological order
            
        } catch (error) {
            console.error(`Error getting stock data for ${stockId}:`, error.message);
            throw error;
        }
    }
}

module.exports = DataCollectorService;
