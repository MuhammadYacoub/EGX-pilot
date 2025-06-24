
import React from 'react';
import { DollarSign, TrendingUp, Percent, CheckCircle } from 'lucide-react';

const FinancialItem = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      <Icon className={`mr-3 ${color}`} size={20} />
      <span className="text-sm text-gray-300">{label}</span>
    </div>
    <span className="text-sm font-mono font-bold text-white">{value}</span>
  </div>
);

const Financials = ({ data }) => {
  const { revenue, netIncome, earningsGrowth, roe } = data;

  return (
    <div className="space-y-2">
      <FinancialItem 
        icon={DollarSign}
        label="Annual Revenue"
        value={`$${(revenue / 1_000_000_000).toFixed(2)}B`}
        color="text-green-400"
      />
      <FinancialItem 
        icon={CheckCircle}
        label="Net Income"
        value={`$${(netIncome / 1_000_000_000).toFixed(2)}B`}
        color="text-green-400"
      />
      <FinancialItem 
        icon={TrendingUp}
        label="Earnings Growth (YoY)"
        value={`${earningsGrowth.toFixed(1)}%`}
        color="text-cyan-400"
      />
      <FinancialItem 
        icon={Percent}
        label="Return on Equity (ROE)"
        value={`${roe.toFixed(1)}%`}
        color="text-purple-400"
      />
    </div>
  );
};

export default Financials;
