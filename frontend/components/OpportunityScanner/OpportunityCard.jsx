
import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

const OpportunityCard = ({ opportunity }) => {
  const {
    symbol,
    name,
    price,
    change,
    changePercent,
    volume,
    opportunityType,
    pattern,
    signalStrength,
  } = opportunity;

  const isPositive = change >= 0;

  const getSignalStrengthColor = (strength) => {
    if (strength > 75) return 'text-success';
    if (strength > 50) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="opportunity-card animate-slide-in">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-secondary arabic-text">{name}</p>
          <h3 className="text-xl font-bold text-primary english-text">{symbol}</h3>
        </div>
        <div className={`flex items-center text-lg font-semibold ${isPositive ? 'price-up' : 'price-down'}`}>
          {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          <span>{changePercent.toFixed(2)}%</span>
        </div>
      </div>

      <div className="my-4">
        <p className="text-2xl font-mono text-primary english-text">${price.toFixed(2)}</p>
        <p className="text-xs text-muted english-text">Volume: {(volume / 1_000_000).toFixed(2)}M</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center bg-tertiary p-2 rounded-md">
          <span className="text-secondary font-semibold arabic-text">الفرصة:</span>
          <span className="text-primary font-bold">{opportunityType}</span>
        </div>
        <div className="flex justify-between items-center bg-tertiary p-2 rounded-md">
          <span className="text-secondary font-semibold arabic-text">النمط:</span>
          <span className="text-info">{pattern}</span>
        </div>
        <div className="flex justify-between items-center bg-tertiary p-2 rounded-md">
          <span className="text-secondary font-semibold arabic-text">قوة الإشارة:</span>
          <span className={`${getSignalStrengthColor(signalStrength)} font-bold english-text`}>
            {signalStrength}%
          </span>
        </div>
      </div>

      <button className="mt-4 w-full btn-primary flex items-center justify-center">
        <TrendingUp size={18} className="ml-2" />
        <span className="arabic-text">تحليل</span>
      </button>
    </div>
  );
};

export default OpportunityCard;
