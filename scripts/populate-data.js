#!/usr/bin/env node
// Data Population Script for EGXpilot
// This script populates the database with stock price data and technical analysis

const DataCollectorService = require('../backend/services/dataCollectorService');
const TechnicalAnalysisService = require('../backend/services/technicalAnalysisService');
const { connectDatabase } = require('../config/database');

// Load environment configuration
require('dotenv').config();

class DataPopulator {
    constructor() {
        this.dataCollector = new DataCollectorService();
        this.technicalAnalysis = new TechnicalAnalysisService();
    }

    /**
     * Display progress bar
     */
    showProgress(current, total, label) {
        const percentage = Math.round((current / total) * 100);
        const progressBar = '█'.repeat(Math.round(percentage / 2)) + '░'.repeat(50 - Math.round(percentage / 2));
        process.stdout.write(`\r${label}: [${progressBar}] ${percentage}% (${current}/${total})`);
        if (current === total) {
            console.log(); // New line when complete
        }
    }

    /**
     * Populate all data
     */
    async populateAllData() {
        try {
            console.log('🚀 Starting EGXpilot data population...\n');
            
            // Connect to database
            console.log('📡 Connecting to database...');
            await connectDatabase();
            console.log('✅ Database connected\n');
            
            // Step 1: Collect stock price data
            console.log('📊 Step 1: Collecting stock price data...');
            console.log('─'.repeat(60));
            
            const collectionStats = await this.dataCollector.collectAllStocksData();
            
            console.log(`✅ Price data collection completed:`);
            console.log(`   • Stocks processed: ${collectionStats.successfulStocks}/${collectionStats.totalStocks}`);
            console.log(`   • Total data points: ${collectionStats.totalDataPoints.toLocaleString()}`);
            console.log(`   • Failed stocks: ${collectionStats.failedStocks.length}`);
            if (collectionStats.failedStocks.length > 0) {
                console.log(`   • Failed: ${collectionStats.failedStocks.join(', ')}`);
            }
            console.log();

            // Step 2: Calculate technical analysis
            console.log('📈 Step 2: Calculating technical analysis...');
            console.log('─'.repeat(60));
            
            const analysisStats = await this.technicalAnalysis.calculateAllTechnicalAnalysis();
            
            console.log(`✅ Technical analysis completed:`);
            console.log(`   • Stocks analyzed: ${analysisStats.successfulStocks}/${analysisStats.totalStocks}`);
            console.log(`   • Total calculations: ${analysisStats.totalCalculations.toLocaleString()}`);
            console.log(`   • Failed stocks: ${analysisStats.failedStocks.length}`);
            if (analysisStats.failedStocks.length > 0) {
                console.log(`   • Failed: ${analysisStats.failedStocks.join(', ')}`);
            }
            console.log();

            // Step 3: Data verification
            console.log('🔍 Step 3: Verifying populated data...');
            console.log('─'.repeat(60));
            
            const verificationStats = await this.verifyPopulatedData();
            
            console.log(`✅ Data verification completed:`);
            console.log(`   • Total stocks in database: ${verificationStats.totalStocks}`);
            console.log(`   • Total price data records: ${verificationStats.totalPriceData.toLocaleString()}`);
            console.log(`   • Total technical analysis records: ${verificationStats.totalTechnicalData.toLocaleString()}`);
            console.log(`   • Data integrity: ${verificationStats.dataIntegrity}%`);
            console.log();

            console.log('🎉 Data population completed successfully!');
            console.log('═'.repeat(60));
            console.log('Database is now ready for frontend development');
            
            return {
                success: true,
                stats: {
                    collection: collectionStats,
                    analysis: analysisStats,
                    verification: verificationStats
                }
            };

        } catch (error) {
            console.error('❌ Data population failed:', error.message);
            throw error;
        }
    }

    /**
     * Quick update of latest data
     */
    async quickUpdate() {
        try {
            console.log('⚡ Quick data update...\n');
            
            await connectDatabase();
            console.log('✅ Database connected\n');
            
            // Update latest 30 days for all stocks
            const updateStats = await this.dataCollector.updateLatestData(30);
            
            console.log(`✅ Quick update completed:`);
            console.log(`   • Stocks updated: ${updateStats.successfulStocks}`);
            console.log(`   • New data points: ${updateStats.newDataPoints}`);
            console.log();

            return { success: true, stats: updateStats };

        } catch (error) {
            console.error('❌ Quick update failed:', error.message);
            throw error;
        }
    }

    /**
     * Verify populated data
     */
    async verifyPopulatedData() {
        const sql = require('mssql');
        
        try {
            // Get total stocks
            const stocksResult = await sql.query`SELECT COUNT(*) as total FROM Stocks`;
            const totalStocks = stocksResult.recordset[0].total;

            // Get total price data
            const priceDataResult = await sql.query`SELECT COUNT(*) as total FROM StockData`;
            const totalPriceData = priceDataResult.recordset[0].total;

            // Get total technical analysis data
            const technicalDataResult = await sql.query`SELECT COUNT(*) as total FROM TechnicalAnalysis`;
            const totalTechnicalData = technicalDataResult.recordset[0].total;

            // Calculate data integrity (should have data for most stocks)
            const stocksWithDataResult = await sql.query`
                SELECT COUNT(DISTINCT stock_id) as total 
                FROM StockData 
                WHERE created_at >= DATEADD(day, -30, GETDATE())
            `;
            const stocksWithData = stocksWithDataResult.recordset[0].total;
            const dataIntegrity = Math.round((stocksWithData / totalStocks) * 100);

            // Get sample data for verification
            const sampleDataResult = await sql.query`
                SELECT TOP 5 
                    s.symbol,
                    s.name,
                    COUNT(sd.id) as price_records,
                    COUNT(ta.id) as technical_records
                FROM Stocks s
                LEFT JOIN StockData sd ON s.id = sd.stock_id
                LEFT JOIN TechnicalAnalysis ta ON s.id = ta.stock_id
                GROUP BY s.id, s.symbol, s.name
                ORDER BY COUNT(sd.id) DESC
            `;

            console.log('\n📋 Sample data verification:');
            sampleDataResult.recordset.forEach(stock => {
                console.log(`   ${stock.symbol}: ${stock.price_records} price records, ${stock.technical_records} technical records`);
            });

            return {
                totalStocks,
                totalPriceData,
                totalTechnicalData,
                dataIntegrity,
                sampleData: sampleDataResult.recordset
            };

        } catch (error) {
            console.error('Verification failed:', error.message);
            throw error;
        }
    }
}

/**
 * Main execution function
 */
async function main() {
    const populator = new DataPopulator();
    const command = process.argv[2] || 'full';
    
    switch (command) {
        case 'full':
            await populator.populateAllData();
            break;
            
        case 'update':
            await populator.quickUpdate();
            break;
            
        case 'verify':
            console.log('🔍 Verifying populated data...\n');
            await connectDatabase();
            const stats = await populator.verifyPopulatedData();
            console.log('\n✅ Verification completed');
            break;
            
        default:
            console.log('Usage: node populate-data.js [command]');
            console.log('Commands:');
            console.log('  full     - Full data population (default)');
            console.log('  update   - Quick update of latest data');
            console.log('  verify   - Verify populated data');
            break;
    }
    
    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Script failed:', error);
        process.exit(1);
    });
}

module.exports = DataPopulator;
