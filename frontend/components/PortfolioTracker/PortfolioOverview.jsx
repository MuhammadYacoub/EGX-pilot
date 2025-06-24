
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, change, changePercent, isCurrency = true, isPositive }) => (
  <div className="trading-card animate-fade-in">
    <p className="text-sm text-secondary-text">{title}</p>
    <p className={`text-xl font-semibold text-primary-text ${isCurrency ? 'font-mono' : ''}`}>
      {isCurrency ? `${value.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} جنيه` : value}
    </p>
    {change !== undefined && changePercent !== undefined && (
      <div className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span className="font-semibold ml-1">
          {isCurrency ? `${change.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} جنيه` : change}
          ({changePercent.toFixed(2)}%)
        </span>
      </div>
    )}
  </div>
);

const PortfolioOverview = ({ data }) => {
  const {
    totalValue,
    todayChange,
    todayChangePercent,
    overallGain,
    overallGainPercent,
  } = data;

  const isTodayPositive = todayChange >= 0;
  const isOverallPositive = overallGain >= 0;

  return (
    <div className="space-y-4">
      <StatCard 
        title="إجمالي القيمة"
        value={totalValue}
        isPositive={isTodayPositive}
      />
      <StatCard 
        title="ربح/خسارة اليوم"
        value={todayChange}
        change={todayChange}
        changePercent={todayChangePercent}
        isPositive={isTodayPositive}
      />
      <StatCard 
        title="الربح/الخسارة الإجمالية"
        value={overallGain}
        change={overallGain}
        changePercent={overallGainPercent}
        isPositive={isOverallPositive}
      />
    </div>
  );
};

export default PortfolioOverview;
