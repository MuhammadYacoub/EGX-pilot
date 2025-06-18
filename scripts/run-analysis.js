// Technical Analysis Script for EGXpilot
// Runs technical analysis on all stocks with sufficient data

require('dotenv').config();
const TechnicalAnalysisService = require('../backend/services/technicalAnalysisService');

async function runTechnicalAnalysis() {
    console.log('🔧 EGXpilot Technical Analysis\n');
    console.log('==============================\n');
    
    const analysisService = new TechnicalAnalysisService();
    
    try {
        console.log('📊 Starting technical analysis for all stocks...\n');
        
        const stats = await analysisService.calculateAllTechnicalAnalysis();
        
        console.log('\n📈 Technical Analysis Summary:');
        console.log(`  ✅ Total stocks processed: ${stats.totalStocks}`);
        console.log(`  ✅ Successful analyses: ${stats.successfulStocks}`);
        console.log(`  ❌ Failed stocks: ${stats.failedStocks.length}`);
        console.log(`  📊 Total calculations: ${stats.totalCalculations.toLocaleString()}`);
        
        if (stats.failedStocks.length > 0) {
            console.log(`\n⚠️  Failed stocks: ${stats.failedStocks.join(', ')}`);
        }
        
        console.log('\n🎉 Technical analysis completed!');
        console.log('\n📋 Available indicators:');
        console.log('  • SMA (20, 50)');
        console.log('  • EMA (12, 26)');
        console.log('  • RSI (14)');
        console.log('  • MACD (12, 26, 9)');
        console.log('  • Bollinger Bands (20, 2)');
        
    } catch (error) {
        console.error('❌ Technical analysis failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runTechnicalAnalysis().catch(console.error);
}

module.exports = runTechnicalAnalysis;
