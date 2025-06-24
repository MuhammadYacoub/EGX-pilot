import React, { useState } from 'react';

const TopStocks = ({ onStockSelect }) => {
  const [activeTab, setActiveTab] = useState('gainers');

  // Dummy data - will be replaced by API data
  const stocks = {
    gainers: [
      { symbol: 'COMI', name: 'البنك التجاري الدولي', price: 52.3, change: 8.45 },
      { symbol: 'EAST', name: 'الشرقية للدخان', price: 18.75, change: 6.2 },
      { symbol: 'HRHO', name: 'فنادق مصر', price: 15.2, change: 5.8 },
      { symbol: 'EGTS', name: 'النقل المصرية', price: 2.85, change: 4.75 },
      { symbol: 'MNHD', name: 'مدينة نصر للإسكان', price: 8.9, change: 4.2 },
    ],
    losers: [
      { symbol: 'AMOC', name: 'الإسكندرية للزيوت المعدنية', price: 9.1, change: -5.5 },
      { symbol: 'EKHO', name: 'إعمار مصر', price: 4.2, change: -4.1 },
      { symbol: 'CIRA', name: 'القاهرة للاستثمار', price: 12.5, change: -3.2 },
      { symbol: 'ORAS', name: 'أوراسكوم للاستثمار', price: 0.25, change: -2.9 },
      { symbol: 'TALM', name: 'طلعت مصطفى', price: 25.1, change: -1.8 },
    ],
    active: [
        { symbol: 'COMI', name: 'البنك التجاري الدولي', volume: '2.3M' },
        { symbol: 'TALM', name: 'طلعت مصطفى', volume: '1.8M' },
        { symbol: 'MNHD', name: 'مدينة نصر للإسكان', volume: '1.2M' },
        { symbol: 'HRHO', name: 'فنادق مصر', volume: '956K' },
        { symbol: 'EGTS', name: 'النقل المصرية', volume: '687K' },
    ],
  };

  const renderStockList = () => {
    const list = stocks[activeTab] || [];
    return list.map((stock, index) => (
      <li 
        key={stock.symbol}
        className="flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer hover:bg-glass transition-all duration-200 hover:scale-105"
        onClick={() => onStockSelect(stock.symbol)}
      >
        <div className="flex items-center">
          <div className="font-bold text-secondary-text mr-4">{index + 1}</div>
          <div>
            <div className="font-semibold text-primary-text">{stock.symbol}</div>
            <div className="text-xs text-secondary-text truncate w-32">{stock.name}</div>
          </div>
        </div>
        <div className="text-right">
          {activeTab !== 'active' ? (
            <>
              <div className="font-semibold text-primary-text">{stock.price?.toFixed(2)} جنيه</div>
              <div className={`text-sm font-medium ${stock.change > 0 ? 'text-success' : 'text-danger'}`}>
                {stock.change > 0 ? '+' : ''}{stock.change?.toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="font-semibold text-primary-text">{stock.volume}</div>
          )}
        </div>
      </li>
    ));
  };

  const getTabClass = (tabName) => {
    return `px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 w-full ${
      activeTab === tabName
        ? 'bg-primary text-white shadow-glow'
        : 'text-secondary-text hover:bg-glass hover:text-primary-text'
    }`;
  };

  return (
    <div className="trading-card animate-fade-in h-full">
      <h3 className="text-lg font-bold text-primary-text mb-4">محركات السوق</h3>
      <div className="flex items-center justify-between bg-glass p-1 rounded-lg mb-4 space-x-1">
        <button onClick={() => setActiveTab('gainers')} className={getTabClass('gainers')}>
          الأعلى ارتفاعاً
        </button>
        <button onClick={() => setActiveTab('losers')} className={getTabClass('losers')}>
          الأعلى انخفاضاً
        </button>
        <button onClick={() => setActiveTab('active')} className={getTabClass('active')}>
          الأكثر نشاطاً
        </button>
      </div>
      <ul className="space-y-1">
        {renderStockList()}
      </ul>
    </div>
  );
};

export default TopStocks;
