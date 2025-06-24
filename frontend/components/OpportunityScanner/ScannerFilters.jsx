import React from 'react';

const ScannerFilters = ({ onFilterChange }) => {

  // Dummy options for filters
  const filterOptions = {
    patterns: ['جميع الأنماط', 'الابتلاع الصاعد', 'تقاطع MACD', 'RSI منخفض', 'التقاطع الذهبي'],
    timeframes: ['جميع الفترات الزمنية', '1 ساعة', '4 ساعات', 'يومي', 'أسبوعي'],
    marketCap: ['أي قيمة سوقية', '> 1 مليار جنيه', '> 5 مليار جنيه', '> 10 مليار جنيه'],
  };

  const handleFilterChange = (filterName, value) => {
    // In a real app, you would call onFilterChange here
    // onFilterChange(prevFilters => ({ ...prevFilters, [filterName]: value }));
    console.log(`Filter changed: ${filterName} = ${value}`);
  };

  return (
    <div className="trading-card animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Pattern Filter */}
        <div>
          <label htmlFor="pattern-filter" className="block text-sm font-medium text-secondary-text mb-1">النمط</label>
          <select 
            id="pattern-filter"
            className="w-full bg-glass text-primary-text border border-primary/30 rounded-md p-2 focus:ring-primary focus:border-primary transition-all duration-200"
            onChange={(e) => handleFilterChange('pattern', e.target.value)}
          >
            {filterOptions.patterns.map(opt => <option key={opt} value={opt} className="bg-secondary text-primary-text">{opt}</option>)}
          </select>
        </div>

        {/* Timeframe Filter */}
        <div>
          <label htmlFor="timeframe-filter" className="block text-sm font-medium text-secondary-text mb-1">الإطار الزمني</label>
          <select 
            id="timeframe-filter"
            className="w-full bg-glass text-primary-text border border-primary/30 rounded-md p-2 focus:ring-primary focus:border-primary transition-all duration-200"
            onChange={(e) => handleFilterChange('timeframe', e.target.value)}
          >
            {filterOptions.timeframes.map(opt => <option key={opt} value={opt} className="bg-secondary text-primary-text">{opt}</option>)}
          </select>
        </div>

        {/* Market Cap Filter */}
        <div>
          <label htmlFor="marketcap-filter" className="block text-sm font-medium text-secondary-text mb-1">القيمة السوقية</label>
          <select 
            id="marketcap-filter"
            className="w-full bg-glass text-primary-text border border-primary/30 rounded-md p-2 focus:ring-primary focus:border-primary transition-all duration-200"
            onChange={(e) => handleFilterChange('marketCap', e.target.value)}
          >
            {filterOptions.marketCap.map(opt => <option key={opt} value={opt} className="bg-secondary text-primary-text">{opt}</option>)}
          </select>
        </div>

        {/* Apply Button */}
        <button className="w-full bg-primary text-white font-semibold rounded-md p-2 hover:bg-primary/80 transition-all duration-200 hover:scale-105 shadow-glow">
          فحص الآن
        </button>
      </div>
    </div>
  );
};

export default ScannerFilters;
