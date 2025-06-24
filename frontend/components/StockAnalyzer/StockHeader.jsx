
import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Clock, BarChartBig, PieChart } from 'lucide-react';

const Stat = ({ label, value, change, changePercent, isPositive }) => (
  <div>
    <p className="text-sm text-secondary-text">{label}</p>
    <div className="flex items-baseline">
      <p className="text-2xl font-semibold text-primary-text">{value}</p>
      {change !== undefined && (
        <div className={`flex items-center ml-2 text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{change.toFixed(2)} ({changePercent.toFixed(2)}%)</span>
        </div>
      )}
    </div>
  </div>
);

const StockHeader = ({ stock }) => {
  const { 
    symbol, 
    name, 
    lastPrice, 
    change, 
    changePercent, 
    marketCap, 
    volume 
  } = stock;
  const isPositive = change >= 0;

  return (
    <div className="trading-card animate-fade-in">
      {/* Top Row: Name, Symbol, Price */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-text">{name} ({symbol})</h1>
          <p className="text-secondary-text">البيانات حتى إغلاق السوق</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
            <p className={`text-4xl font-mono font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {lastPrice.toFixed(2)} جنيه
            </p>
            <div className={`flex items-center justify-end text-lg font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
                {isPositive ? <TrendingUp size={20} className="mr-1"/> : <TrendingDown size={20} className="mr-1"/>}
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </div>
        </div>
      </div>

      {/* Bottom Row: Key Stats */}
      <div className="mt-4 pt-4 border-t border-primary/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center">
            <PieChart size={18} className="mr-2 text-primary"/>
            <div>
                <p className="text-secondary-text">القيمة السوقية</p>
                <p className="font-semibold text-primary-text font-mono">{(marketCap / 1_000_000_000).toFixed(2)} مليار جنيه</p>
            </div>
        </div>
         <div className="flex items-center">
            <BarChartBig size={18} className="mr-2 text-primary"/>
            <div>
                <p className="text-secondary-text">حجم التداول</p>
                <p className="font-semibold text-primary-text font-mono">{(volume / 1_000_000).toFixed(2)} مليون</p>
            </div>
        </div>
        <div className="flex items-center">
            <TrendingUp size={18} className="mr-2 text-primary"/>
            <div>
                <p className="text-secondary-text">نسبة السعر للربح</p>
                <p className="font-semibold text-primary-text font-mono">{stock.peRatio}</p>
            </div>
        </div>
        <div className="flex items-center">
            <Clock size={18} className="mr-2 text-primary"/>
            <div>
                <p className="text-secondary-text">ربحية السهم</p>
                <p className="font-semibold text-primary-text font-mono">{stock.eps}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockHeader;
