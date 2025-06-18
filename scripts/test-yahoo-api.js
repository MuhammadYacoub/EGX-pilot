// Test Yahoo Finance API for Egyptian stocks
require('dotenv').config();
const axios = require('axios');

async function testYahooFinanceAPI() {
    console.log('🧪 Testing Yahoo Finance API for Egyptian stocks...\n');
    
    const testSymbols = ['CIB.CA', 'COMI.CA', 'HRHO.CA', 'ALEX.CA', 'PALM.CA'];
    
    for (const symbol of testSymbols) {
        try {
            console.log(`🔍 Testing ${symbol}...`);
            
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`;
            
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
                    console.log(`✅ ${symbol}: Found ${timestamps.length} data points`);
                    
                    // Show sample data
                    const lastIndex = timestamps.length - 1;
                    const lastDate = new Date(timestamps[lastIndex] * 1000);
                    console.log(`  📅 Latest date: ${lastDate.toDateString()}`);
                    console.log(`  💰 Price: Open=${prices.open[lastIndex]?.toFixed(2)} High=${prices.high[lastIndex]?.toFixed(2)} Low=${prices.low[lastIndex]?.toFixed(2)} Close=${prices.close[lastIndex]?.toFixed(2)}`);
                    console.log(`  📊 Volume: ${prices.volume[lastIndex]?.toLocaleString() || 'N/A'}`);
                } else {
                    console.log(`❌ ${symbol}: Empty data structure`);
                }
            } else {
                console.log(`❌ ${symbol}: No chart data in response`);
            }
            
        } catch (error) {
            console.log(`❌ ${symbol}: ${error.message}`);
        }
        
        console.log(''); // Empty line
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🏁 Yahoo Finance API test completed!');
}

// Run test
if (require.main === module) {
    testYahooFinanceAPI().catch(console.error);
}

module.exports = testYahooFinanceAPI;
