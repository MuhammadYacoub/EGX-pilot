import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Activity, DollarSign, Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { useMarketData, useTopStocks } from '../../hooks/useMarketData';
import LiveChart from './LiveChart';
import MarketMovers from './MarketMovers'; // Assuming you will create this component

const Dashboard = () => {
  const { marketData, isConnected } = useMarketData();
  const { stocks: topStocks, isLoading: stocksLoading } = useTopStocks();

  return (
    <div className="space-y-6">
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* EGX 30 Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">EGX 30</h3>
            <TrendingUp className={`h-5 w-5 ${marketData.egx30.change > 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="text-gray-900 text-3xl font-bold mb-1">
            {marketData.egx30.value.toLocaleString()}
          </div>
          <div className={`flex items-center text-sm font-semibold ${marketData.egx30.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span>{marketData.egx30.change > 0 ? '+' : ''}{marketData.egx30.change.toFixed(2)}%</span>
            <span className="ml-2">({marketData.egx30.pointsChange.toFixed(2)})</span>
          </div>
        </div>

        {/* EGX 70 Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">EGX 70</h3>
            <TrendingUp className={`h-5 w-5 ${marketData.egx70.change > 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="text-gray-900 text-3xl font-bold mb-1">
            {marketData.egx70.value.toLocaleString()}
          </div>
          <div className={`flex items-center text-sm font-semibold ${marketData.egx70.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
             <span>{marketData.egx70.change > 0 ? '+' : ''}{marketData.egx70.change.toFixed(2)}%</span>
             <span className="ml-2">({marketData.egx70.pointsChange.toFixed(2)})</span>
          </div>
        </div>

        {/* Volume Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Trading Volume</h3>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-gray-900 text-3xl font-bold mb-1">
            {marketData.totalVolume}B
          </div>
           <div className={`flex items-center text-sm font-semibold text-green-600`}>
             <span>+5.2%</span>
             <span className="ml-2">({(marketData.totalVolume * 0.052).toFixed(2)}B)</span>
          </div>
        </div>

        {/* Market Cap Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Market Cap</h3>
            <DollarSign className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-gray-900 text-3xl font-bold mb-1">
            {marketData.marketCap}B
          </div>
           <div className={`flex items-center text-sm font-semibold text-green-600`}>
             <span>+1.8%</span>
             <span className="ml-2">({(marketData.marketCap * 0.018).toFixed(2)}B)</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chart Section */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <LiveChart symbol="EGX30" height={400} />
        </div>

        {/* Market Movers Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <MarketMovers stocks={topStocks} isLoading={stocksLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
