// Stock Data Population Script for EGXpilot
// This script populates the database with Egyptian stock data

require('dotenv').config();
const sql = require('mssql');
const axios = require('axios');
const config = require('../config/environment');

class StockDataPopulator {
    constructor() {
        this.connected = false;
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

    // Generate realistic stock price data
    generatePriceData(symbol, days = 365) {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Base prices for different Egyptian stocks
        const basePrices = {
            'CIB.CA': 45.50,
            'COMI.CA': 8.20,
            'HRHO.CA': 15.30,
            'ADIB.CA': 28.40,
            'ALEX.CA': 12.80,
            'AMER.CA': 7.90,
            'JUFO.CA': 18.60,
            'OCDI.CA': 22.30,
            'ORWE.CA': 6.40,
            'PHDC.CA': 14.70,
            'EFBK.CA': 19.80,
            'GTHE.CA': 11.20,
            'HELI.CA': 34.50,
            'MNHD.CA': 5.60,
            'ESRS.CA': 76.20,
            'ECRD.CA': 13.40,
            'TMGH.CA': 89.30,
            'PALM.CA': 11.80,
            'EGAS.CA': 7.30,
            'SWDY.CA': 4.20
        };

        let currentPrice = basePrices[symbol] || 10.0;
        
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }
            
            // Generate realistic price movement
            const volatility = 0.02; // 2% daily volatility
            const trend = (Math.random() - 0.5) * 0.001; // Small random trend
            const change = (Math.random() - 0.5) * volatility + trend;
            
            currentPrice = Math.max(currentPrice * (1 + change), 0.1);
            
            const open = currentPrice * (1 + (Math.random() - 0.5) * 0.01);
            const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.02);
            const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.02);
            const volume = Math.floor(Math.random() * 1000000) + 50000;
            
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
                console.error(`Error inserting data for ${symbol} on ${data.date}:`, error.message);
            }
        }
        
        console.log(`✅ Inserted ${insertedCount} records for ${symbol}`);
        return insertedCount;
    }

    async populateAllStocks() {
        console.log('🚀 Starting stock data population...\n');
        
        try {
            const stocks = await this.getStocks();
            console.log(`📊 Found ${stocks.length} stocks to populate\n`);
            
            let totalRecords = 0;
            let successfulStocks = 0;
            
            for (let i = 0; i < stocks.length; i++) {
                const stock = stocks[i];
                
                console.log(`[${i + 1}/${stocks.length}] Processing ${stock.Symbol} - ${stock.Name}`);
                
                try {
                    // Generate 1 year of data
                    const priceData = this.generatePriceData(stock.Symbol, 365);
                    
                    // Insert data
                    const inserted = await this.insertStockData(stock.Id, stock.Symbol, priceData);
                    
                    totalRecords += inserted;
                    successfulStocks++;
                    
                    // Small delay to avoid overwhelming the database
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.error(`❌ Failed to process ${stock.Symbol}:`, error.message);
                }
                
                console.log(''); // Empty line for better readability
            }
            
            console.log('📈 Population Summary:');
            console.log(`  ✅ Successful stocks: ${successfulStocks}/${stocks.length}`);
            console.log(`  📊 Total records inserted: ${totalRecords.toLocaleString()}`);
            console.log(`  📅 Date range: ${new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toDateString()} to ${new Date().toDateString()}`);
            
        } catch (error) {
            console.error('❌ Error during population:', error);
        }
    }

    async populateFromYahooFinance() {
        console.log('🌐 Fetching real data from Yahoo Finance...\n');
        
        try {
            const stocks = await this.getStocks();
            console.log(`📊 Found ${stocks.length} stocks to fetch real data for\n`);
            
            let totalRecords = 0;
            let successfulStocks = 0;
            let realDataStocks = 0;
            
            for (let i = 0; i < stocks.length; i++) {
                const stock = stocks[i];
                console.log(`[${i + 1}/${stocks.length}] Processing ${stock.Symbol} - ${stock.Name}`);
                
                try {
                    console.log(`🔍 Fetching real data for ${stock.Symbol}...`);
                    
                    // Yahoo Finance API endpoint
                    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.Symbol}?range=1y&interval=1d`;
                    
                    const response = await axios.get(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        timeout: 10000
                    });
                    
                    if (response.data?.chart?.result?.[0]) {
                        const chartData = response.data.chart.result[0];
                        const timestamps = chartData.timestamp;
                        const prices = chartData.indicators.quote[0];
                        
                        if (timestamps && prices && timestamps.length > 0) {
                            console.log(`✅ Found ${timestamps.length} real data points for ${stock.Symbol}`);
                            
                            // Convert Yahoo data to our format
                            const realPriceData = [];
                            for (let j = 0; j < timestamps.length; j++) {
                                if (prices.open[j] && prices.high[j] && prices.low[j] && prices.close[j]) {
                                    const date = new Date(timestamps[j] * 1000);
                                    realPriceData.push({
                                        date: date.toISOString().split('T')[0],
                                        open: Number(prices.open[j].toFixed(2)),
                                        high: Number(prices.high[j].toFixed(2)),
                                        low: Number(prices.low[j].toFixed(2)),
                                        close: Number(prices.close[j].toFixed(2)),
                                        volume: prices.volume[j] || 0
                                    });
                                }
                            }
                            
                            if (realPriceData.length > 0) {
                                const inserted = await this.insertStockData(stock.Id, stock.Symbol, realPriceData);
                                totalRecords += inserted;
                                successfulStocks++;
                                realDataStocks++;
                                console.log(`🌐 Used REAL data for ${stock.Symbol}`);
                            } else {
                                throw new Error('No valid price data after processing');
                            }
                        } else {
                            throw new Error('Empty or invalid data structure');
                        }
                    } else {
                        throw new Error('No chart data in response');
                    }
                    
                } catch (error) {
                    console.log(`⚠️  Failed to fetch real data for ${stock.Symbol}: ${error.message}`);
                    console.log(`📊 Using generated data for ${stock.Symbol}...`);
                    
                    // Fall back to generated data
                    try {
                        const generatedData = this.generatePriceData(stock.Symbol, 365);
                        const inserted = await this.insertStockData(stock.Id, stock.Symbol, generatedData);
                        totalRecords += inserted;
                        successfulStocks++;
                        console.log(`🤖 Used GENERATED data for ${stock.Symbol}`);
                    } catch (genError) {
                        console.error(`❌ Failed to generate data for ${stock.Symbol}: ${genError.message}`);
                    }
                }
                
                // Rate limiting to avoid being blocked
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log(''); // Empty line for better readability
            }
            
            console.log('📈 Yahoo Finance Population Summary:');
            console.log(`  ✅ Successful stocks: ${successfulStocks}/${stocks.length}`);
            console.log(`  🌐 Real data stocks: ${realDataStocks}/${stocks.length}`);
            console.log(`  🤖 Generated data stocks: ${successfulStocks - realDataStocks}/${stocks.length}`);
            console.log(`  📊 Total records inserted: ${totalRecords.toLocaleString()}`);
            
            return {
                totalStocks: stocks.length,
                successfulStocks,
                realDataStocks,
                generatedDataStocks: successfulStocks - realDataStocks,
                totalRecords
            };
            
        } catch (error) {
            console.error('❌ Error during Yahoo Finance population:', error);
            throw error;
        }
    }

    async createSampleUser() {
        console.log('👤 Creating sample user...');
        
        try {
            const result = await sql.query`
                SELECT COUNT(*) as count FROM Users WHERE Email = 'demo@egxpilot.com'
            `;
            
            if (result.recordset[0].count === 0) {
                await sql.query`
                    INSERT INTO Users (
                        Id, Email, PasswordHash, FirstName, LastName,
                        IsActive, CreatedAt
                    ) VALUES (
                        NEWID(),
                        'demo@egxpilot.com',
                        '$2a$10$rOFLDSDfpbS8aQjMtjYJqeK8mX1L8vNcJ6Y9c2K3xL7sP8dQ9fR6G',
                        'Demo', 'User', 1, GETDATE()
                    )
                `;
                console.log('✅ Demo user created (email: demo@egxpilot.com, password: demo123)');
            } else {
                console.log('✅ Demo user already exists');
            }
            
        } catch (error) {
            console.error('❌ Failed to create demo user:', error.message);
        }
    }
}

async function main() {
    const populator = new StockDataPopulator();
    
    try {
        console.log('🏁 EGXpilot Stock Data Population\n');
        console.log('==========================================\n');
        
        // Connect to database
        await populator.connect();
        
        // Create demo user
        await populator.createSampleUser();
        
        console.log(''); // Empty line
        
        // Try to get real data from Yahoo Finance first
        console.log('📊 Populating stock price data with real Yahoo Finance data...\n');
        const yahooResult = await populator.populateFromYahooFinance();
        
        console.log('\n🎉 Data population completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('  1. Run technical analysis: npm run analyze');
        console.log('  2. Start the server: npm run dev');
        console.log('  3. Access health check: http://localhost:5000/health');
        console.log('  4. Login with demo user: demo@egxpilot.com / demo123');
        
    } catch (error) {
        console.error('\n❌ Population failed:', error);
        process.exit(1);
    } finally {
        await populator.disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = StockDataPopulator;
