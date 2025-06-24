import React from 'react';
import MarketOverview from './MarketOverview';
import LiveChart from './LiveChart';
import TopStocks from './TopStocks';
import TechnicalSummary from './TechnicalSummary';
import NewsPanel from './NewsPanel';
import QuickActions from './QuickActions';

const TradingDashboard = ({ marketData, onStockSelect }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <MarketOverview marketData={marketData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LiveChart symbol="EGX30" onStockSelect={onStockSelect} />
          <TechnicalSummary />
        </div>
        <div className="space-y-6">
          <TopStocks onStockSelect={onStockSelect} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActions />
      </div>

       <div className="grid grid-cols-1">
          <NewsPanel />
      </div>

    </div>
  );
};

export default TradingDashboard;
