import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const MarketMovers = ({ stocks, isLoading }) => {
  const [activeTab, setActiveTab] = useState('top-gainers');

  const renderStockList = (stockList) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 animate-pulse">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ));
    }

    return stockList.slice(0, 5).map((stock, index) => (
      <li key={index} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-gray-50">
        <div className="flex items-center">
          <div className="font-bold text-gray-500 mr-4">{index + 1}</div>
          <div>
            <div className="font-semibold text-gray-800">{stock.symbol}</div>
            <div className="text-xs text-gray-500 truncate w-28">{stock.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-800">{stock.price.toFixed(2)} EGP</div>
          <div className={`text-sm font-medium ${stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </div>
        </div>
      </li>
    ));
  };

  const getTabClass = (tabName) => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeTab === tabName
        ? 'bg-blue-500 text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`;
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Market Movers</h3>
      <div className="flex items-center justify-between bg-gray-100 p-1 rounded-lg mb-4">
        <button onClick={() => setActiveTab('top-gainers')} className={getTabClass('top-gainers')}>
          Top Gainers
        </button>
        <button onClick={() => setActiveTab('top-losers')} className={getTabClass('top-losers')}>
          Top Losers
        </button>
        <button onClick={() => setActiveTab('most-active')} className={getTabClass('most-active')}>
          Most Active
        </button>
      </div>
      <ul className="space-y-1">
        {renderStockList(stocks[activeTab] || [])}
      </ul>
    </div>
  );
};

export default MarketMovers;
