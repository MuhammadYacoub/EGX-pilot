
import React from 'react';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

const MetricItem = ({ icon: Icon, label, value, color, tooltip }) => (
  <div className="flex items-center justify-between bg-gray-900/70 p-3 rounded-lg" title={tooltip}>
    <div className="flex items-center">
      <Icon className={`mr-3 ${color}`} size={20} />
      <span className="text-gray-300 font-semibold">{label}</span>
    </div>
    <span className="font-mono font-bold text-white">{value}</span>
  </div>
);

const RiskMetrics = ({ data }) => {
  const {
    beta,
    sharpeRatio,
    maxDrawdown,
    volatility,
  } = data;

  return (
    <div className="space-y-3">
      <MetricItem 
        icon={TrendingUp}
        label="Beta"
        value={beta.toFixed(2)}
        color="text-purple-400"
        tooltip="Measures volatility relative to the market."
      />
      <MetricItem 
        icon={Target}
        label="Sharpe Ratio"
        value={sharpeRatio.toFixed(2)}
        color="text-green-400"
        tooltip="Measures risk-adjusted return."
      />
       <MetricItem 
        icon={TrendingDown}
        label="Max Drawdown"
        value={`${maxDrawdown.toFixed(2)}%`}
        color="text-red-400"
        tooltip="Largest peak-to-trough decline."
      />
      <MetricItem 
        icon={Zap}
        label="Volatility"
        value={`${volatility.toFixed(2)}%`}
        color="text-yellow-400"
        tooltip="Standard deviation of asset returns."
      />
    </div>
  );
};

export default RiskMetrics;
