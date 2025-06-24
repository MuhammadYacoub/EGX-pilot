import React from 'react';
import { TrendingUp, Activity, DollarSign } from 'lucide-react';

const MarketOverview = ({ marketData }) => {
  const overviewCards = [
    {
      title: 'EGX 30',
      value: marketData?.egx30?.value.toLocaleString() || 'N/A',
      change: marketData?.egx30?.change || 0,
      pointsChange: marketData?.egx30?.pointsChange || 0,
      icon: <TrendingUp />,
    },
    {
      title: 'EGX 70',
      value: marketData?.egx70?.value.toLocaleString() || 'N/A',
      change: marketData?.egx70?.change || 0,
      pointsChange: marketData?.egx70?.pointsChange || 0,
      icon: <TrendingUp />,
    },
    {
      title: 'Trading Volume',
      value: `${marketData?.totalVolume}B` || 'N/A',
      change: 5.2, // Dummy data for now
      icon: <Activity />,
    },
    {
      title: 'Market Cap',
      value: `${marketData?.marketCap}B` || 'N/A',
      change: 1.8, // Dummy data for now
      icon: <DollarSign />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewCards.map((card, index) => (
        <div key={index} className="trading-card animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-secondary text-sm font-medium arabic-text">{card.title}</h3>
            <div className={`${card.change > 0 ? 'text-success' : 'text-danger'}`}>
              {card.icon}
            </div>
          </div>
          <div className="text-primary text-3xl font-bold mb-1 english-text">{card.value}</div>
          <div className={`flex items-center text-sm font-semibold ${card.change > 0 ? 'price-up' : 'price-down'}`}>
            <span>{card.change > 0 ? '+' : ''}{card.change.toFixed(2)}%</span>
            {card.pointsChange !== undefined && (
                 <span className="ml-2 text-muted">({card.pointsChange.toFixed(2)})</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketOverview;
