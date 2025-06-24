import React from 'react';

const TechnicalSummary = () => {
  // Dummy data for technical indicators
  const indicators = [
    {
      name: 'RSI (14)',
      value: '67.34',
      signal: 'Buy',
      interpretation: 'Approaching overbought',
    },
    {
      name: 'MACD (12, 26)',
      value: '45.23',
      signal: 'Buy',
      interpretation: 'Bullish crossover',
    },
    {
      name: 'EMA (20)',
      value: '18234',
      signal: 'Buy',
      interpretation: 'Price above EMA',
    },
    {
        name: 'Stochastic (14, 3, 3)',
        value: '78.91',
        signal: 'Neutral',
        interpretation: 'In overbought territory',
    },
  ];

  const getSignalClass = (signal) => {
    switch (signal) {
      case 'Buy':
        return 'bg-green-500/20 text-green-400';
      case 'Sell':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="trading-card p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-foreground">Technical Analysis Summary</h3>
        <div className="text-sm text-foreground">
            Overall Signal: <span className="font-bold text-green-400">Strong Buy</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator) => (
          <div key={indicator.name} className="metric-card p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium">{indicator.name}</p>
            <p className="text-2xl font-bold text-foreground my-1">{indicator.value}</p>
            <div className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${getSignalClass(indicator.signal)}`}>
              {indicator.signal}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{indicator.interpretation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSummary;
