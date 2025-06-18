// Enhanced Stock Data Populator with Real Data Integration
require('dotenv').config();
const sql = require('mssql');
const axios = require('axios');
const config = require('../config/environment');

class EnhancedStockDataPopulator {
    constructor() {
        this.connected = false;
        this.useRealData = true;
        this.fallbackToGenerated = true;
    }

    async connect() {
        if (!this.connected) {
            await sql.connect(config.database);
            this.connected = true;
            console.log('✅ Connected to database');
        }
    }

    async disconnect() {
        if (this.connected) {
            await sql.close();
            this.connected = false;
            console.log('✅ Disconnected from database');
        }
    }

    // Enhanced Yahoo Finance data fetcher with better error handling
    async fetchYahooData(symbol, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`  🔄 Attempt ${attempt}/${retries} for ${symbol}...`);
                
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`;
                
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    },
                    timeout: 15000,
                    validateStatus: function (status) {
                        return status >= 200 && status < 300;
                    }
                });
                
                if (response.data?.chart?.result?.[0]) {
                    const chartData = response.data.chart.result[0];
                    const timestamps = chartData.timestamp;
                    const prices = chartData.indicators?.quote?.[0];
                    
                    if (timestamps && prices && timestamps.length > 0) {
                        // Validate data quality
                        const validDataCount = timestamps.filter((_, i) => 
                            prices.open[i] && prices.high[i] && prices.low[i] && prices.close[i]
                        ).length;
                        
                        if (validDataCount > 10) { // At least 10 valid data points
                            return { timestamps, prices, validDataCount };
                        } else {
                            throw new Error(`Insufficient valid data points: ${validDataCount}`);
                        }
                    } else {
                        throw new Error('Empty or invalid price data structure');
                    }
                } else {
                    throw new Error('No chart data in API response');
                }
                
            } catch (error) {
                console.log(`  ⚠️  Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt === retries) {
                    throw new Error(`All ${retries} attempts failed. Last error: ${error.message}`);
                }
                
                // Wait before retry (exponential backoff)
                const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    // Convert Yahoo data to our database format
    convertYahooData(yahooData) {
        const { timestamps, prices } = yahooData;
        const priceData = [];
        
        for (let i = 0; i < timestamps.length; i++) {
            if (prices.open[i] && prices.high[i] && prices.low[i] && prices.close[i]) {
                const date = new Date(timestamps[i] * 1000);
                
                // Skip weekends (although Yahoo usually doesn't include them)
                if (date.getDay() !== 0 && date.getDay() !== 6) {
                    priceData.push({
                        date: date.toISOString().split('T')[0],
                        open: Number(prices.open[i].toFixed(2)),
                        high: Number(prices.high[i].toFixed(2)),
                        low: Number(prices.low[i].toFixed(2)),
                        close: Number(prices.close[i].toFixed(2)),
                        volume: prices.volume[i] || 0
                    });
                }
            }
        }
        
        return priceData;
    }

    // Enhanced price data generator with more realistic patterns
    generateEnhancedPriceData(symbol, days = 365, basePrice = null) {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Enhanced base prices for Egyptian stocks
        const basePrices = {
            'CIB.CA': 45.50, 'COMI.CA': 8.20, 'HRHO.CA': 15.30, 'ADIB.CA': 28.40,
            'ALEX.CA': 12.80, 'AMER.CA': 7.90, 'JUFO.CA': 18.60, 'OCDI.CA': 22.30,
            'ORWE.CA': 6.40, 'PHDC.CA': 14.70, 'EFBK.CA': 19.80, 'GTHE.CA': 11.20,
            'HELI.CA': 34.50, 'MNHD.CA': 5.60, 'ESRS.CA': 76.20, 'ECRD.CA': 13.40,
            'TMGH.CA': 89.30, 'PALM.CA': 11.80, 'EGAS.CA': 7.30, 'SWDY.CA': 4.20,
            'ABUK.CA': 42.10, 'ADPH.CA': 18.90, 'DOMTY.CA': 12.40, 'EAST.CA': 16.70,
            'EGTS.CA': 9.80, 'ETEL.CA': 24.30, 'EXPA.CA': 31.20, 'FWRY.CA': 14.80,
            'IRON.CA': 7.60, 'KABO.CA': 11.90, 'KARF.CA': 19.40, 'KIMA.CA': 8.70,
            'METRO.CA': 13.50, 'MOPCO.CA': 21.80, 'NILE.CA': 6.90, 'ORTE.CA': 25.60,
            'RAYA.CA': 17.30, 'SPIN.CA': 10.20, 'SUCE.CA': 33.40, 'TABA.CA': 15.10,
            'TORA.CA': 28.90
        };

        let currentPrice = basePrice || basePrices[symbol] || (10 + Math.random() * 20);
        
        // Market trends and seasonality
        const yearlyTrend = (Math.random() - 0.5) * 0.0001; // Small yearly trend
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }
            
            // Enhanced price movement with market patterns
            const dayOfWeek = date.getDay();
            const monthOfYear = date.getMonth();
            
            // Different volatility based on market conditions
            let volatility = 0.015; // Base 1.5% daily volatility
            
            // Increase volatility on Mondays and Fridays
            if (dayOfWeek === 1 || dayOfWeek === 5) {
                volatility *= 1.2;
            }
            
            // Seasonal adjustments (summer months typically lower volatility)
            if (monthOfYear >= 5 && monthOfYear <= 8) {
                volatility *= 0.8;
            }
            
            // Random market events (5% chance of high volatility day)
            if (Math.random() < 0.05) {
                volatility *= 2.5;
            }
            
            const trend = yearlyTrend + (Math.random() - 0.5) * 0.002;
            const change = (Math.random() - 0.5) * volatility + trend;
            
            currentPrice = Math.max(currentPrice * (1 + change), 0.1);
            
            // More realistic intraday price action
            const openGap = (Math.random() - 0.5) * 0.015; // Gap up/down
            const open = Math.max(currentPrice * (1 + openGap), 0.1);
            
            const intradayRange = volatility * 0.8;
            const high = Math.max(open, currentPrice) * (1 + Math.random() * intradayRange);
            const low = Math.min(open, currentPrice) * (1 - Math.random() * intradayRange);
            
            // Volume patterns (higher on volatile days)
            const baseVolume = 100000 + Math.random() * 500000;
            const volumeMultiplier = 1 + Math.abs(change) * 20; // Higher volume on big moves
            const volume = Math.floor(baseVolume * volumeMultiplier);
            
            data.push({
                date: date.toISOString().split('T')[0],
                open: Number(open.toFixed(2)),
                high: Number(high.toFixed(2)),
                low: Number(low.toFixed(2)),
                close: Number(currentPrice.toFixed(2)),
                volume: volume
            });
        }
        
        return data;
    }

    async getStocks() {
        await this.connect();
        
        const result = await sql.query`
            SELECT Id, Symbol, Name 
            FROM Stocks 
            WHERE IsActive = 1 OR IsActive IS NULL
            ORDER BY Symbol
        `;
        
        return result.recordset;
    }

    async insertStockData(stockId, symbol, priceData) {
        console.log(`📈 Inserting ${priceData.length} records for ${symbol}...`);
        
        // Clear existing data
        await sql.query`DELETE FROM StockData WHERE StockId = ${stockId}`;
        
        let insertedCount = 0;
        
        for (const data of priceData) {
            try {
                await sql.query`
                    INSERT INTO StockData (
                        Id, StockId, Date, TimeFrame, [Open], [High], 
                        [Low], [Close], Volume, CreatedAt
                    ) VALUES (
                        NEWID(), ${stockId}, ${data.date}, '1d', ${data.open}, ${data.high},
                        ${data.low}, ${data.close}, ${data.volume}, GETDATE()
                    )
                `;
                insertedCount++;
            } catch (error) {
                console.error(`  ❌ Error inserting data for ${symbol} on ${data.date}:`, error.message);
            }
        }
        
        console.log(`✅ Inserted ${insertedCount} records for ${symbol}`);
        return insertedCount;
    }

    async populateWithEnhancedData() {
        console.log('🚀 Starting enhanced stock data population...\n');
        
        try {
            const stocks = await this.getStocks();
            console.log(`📊 Found ${stocks.length} stocks to populate\n`);
            
            let totalRecords = 0;
            let successfulStocks = 0;
            let realDataStocks = 0;
            let enhancedDataStocks = 0;
            
            for (let i = 0; i < stocks.length; i++) {
                const stock = stocks[i];
                
                console.log(`[${i + 1}/${stocks.length}] Processing ${stock.Symbol} - ${stock.Name}`);
                
                let priceData = null;
                let dataSource = 'UNKNOWN';
                
                // Try to fetch real data from Yahoo Finance
                if (this.useRealData) {
                    try {
                        console.log(`🌐 Attempting to fetch real data for ${stock.Symbol}...`);
                        const yahooData = await this.fetchYahooData(stock.Symbol);
                        priceData = this.convertYahooData(yahooData);
                        
                        if (priceData.length > 0) {
                            dataSource = 'YAHOO_FINANCE';
                            realDataStocks++;
                            console.log(`✅ Successfully fetched ${priceData.length} real data points`);
                        }
                        
                    } catch (error) {
                        console.log(`⚠️  Yahoo Finance failed: ${error.message}`);
                    }
                }
                
                // Fall back to enhanced generated data
                if (!priceData || priceData.length === 0) {
                    if (this.fallbackToGenerated) {
                        console.log(`🤖 Generating enhanced synthetic data for ${stock.Symbol}...`);
                        priceData = this.generateEnhancedPriceData(stock.Symbol, 365);
                        dataSource = 'ENHANCED_GENERATED';
                        enhancedDataStocks++;
                        console.log(`✅ Generated ${priceData.length} enhanced data points`);
                    } else {
                        console.log(`❌ Skipping ${stock.Symbol} - no data available`);
                        continue;
                    }
                }
                
                // Insert data
                try {
                    const inserted = await this.insertStockData(stock.Id, stock.Symbol, priceData);
                    totalRecords += inserted;
                    successfulStocks++;
                    
                    console.log(`📊 Data source: ${dataSource}`);
                    
                } catch (error) {
                    console.error(`❌ Failed to insert data for ${stock.Symbol}:`, error.message);
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
                console.log(''); // Empty line for better readability
            }
            
            console.log('📈 Enhanced Population Summary:');
            console.log(`  ✅ Successful stocks: ${successfulStocks}/${stocks.length}`);
            console.log(`  🌐 Real data (Yahoo): ${realDataStocks}/${stocks.length}`);
            console.log(`  🤖 Enhanced generated: ${enhancedDataStocks}/${stocks.length}`);
            console.log(`  📊 Total records: ${totalRecords.toLocaleString()}`);
            console.log(`  📅 Date range: ~1 year of historical data`);
            
            return {
                totalStocks: stocks.length,
                successfulStocks,
                realDataStocks,
                enhancedDataStocks,
                totalRecords
            };
            
        } catch (error) {
            console.error('❌ Error during enhanced population:', error);
            throw error;
        }
    }
}

async function main() {
    const populator = new EnhancedStockDataPopulator();
    
    try {
        console.log('🏁 EGXpilot Enhanced Stock Data Population\n');
        console.log('==========================================\n');
        
        // Connect to database
        await populator.connect();
        
        // Populate with enhanced data (real + generated)
        const result = await populator.populateWithEnhancedData();
        
        console.log('\n🎉 Enhanced data population completed successfully!');
        console.log('\n📋 Summary:');
        console.log(`  📊 ${result.realDataStocks} stocks with real Yahoo Finance data`);
        console.log(`  🤖 ${result.enhancedDataStocks} stocks with enhanced generated data`);
        console.log(`  📈 ${result.totalRecords.toLocaleString()} total price records inserted`);
        
        console.log('\n📋 Next steps:');
        console.log('  1. Run technical analysis: npm run analyze');
        console.log('  2. Start the server: npm run dev');
        console.log('  3. Access health check: http://localhost:5000/health');
        
    } catch (error) {
        console.error('\n❌ Enhanced population failed:', error);
        process.exit(1);
    } finally {
        await populator.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = EnhancedStockDataPopulator;
