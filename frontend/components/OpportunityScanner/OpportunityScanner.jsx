import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Loader } from 'lucide-react';
import ScannerFilters from './ScannerFilters';
import OpportunityCard from './OpportunityCard';

// Mock data - in a real app, this would come from an API
const mockOpportunities = [
  {
    symbol: 'COMI',
    name: 'Commercial Intl. Bank',
    price: 62.50,
    change: 1.25,
    changePercent: 2.04,
    volume: 5_200_000,
    opportunityType: 'Breakout',
    pattern: 'Ascending Triangle',
    signalStrength: 87,
  },
  {
    symbol: 'HRHO',
    name: 'Hermes Holding',
    price: 15.40,
    change: -0.15,
    changePercent: -0.96,
    volume: 3_100_000,
    opportunityType: 'Volume Surge',
    pattern: 'Bull Flag',
    signalStrength: 82,
  },
  {
    symbol: 'SWDY',
    name: 'El Sewedy Electric',
    price: 42.10,
    change: 0.80,
    changePercent: 1.94,
    volume: 1_800_000,
    opportunityType: 'Wyckoff Spring',
    pattern: 'Cup & Handle',
    signalStrength: 79,
  },
    {
    symbol: 'ETEL',
    name: 'Telecom Egypt',
    price: 28.70,
    change: 0.90,
    changePercent: 3.24,
    volume: 7_500_000,
    opportunityType: 'Momentum',
    pattern: 'RSI Oversold',
    signalStrength: 91,
  },
  {
    symbol: 'TCSD',
    name: 'Talaat Moustafa Group',
    price: 21.15,
    change: -0.35,
    changePercent: -1.63,
    volume: 4_200_000,
    opportunityType: 'Reversal',
    pattern: 'Double Bottom',
    signalStrength: 75,
  },
  {
    symbol: 'FWRY',
    name: 'Fawry',
    price: 5.50,
    change: 0.25,
    changePercent: 4.76,
    volume: 12_300_000,
    opportunityType: 'High Volume',
    pattern: 'Volume Spike',
    signalStrength: 88,
  },
];


const OpportunityScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
      type: 'all',
      strategy: 'all',
      sector: 'all'
  });

  const handleScan = () => {
    setIsScanning(true);
    setOpportunities([]);
    // Simulate API call
    setTimeout(() => {
      setOpportunities(mockOpportunities);
      setIsScanning(false);
    }, 1500);
  };
  
  // Trigger initial scan on component mount
  useEffect(() => {
    handleScan();
  }, []);

  const filteredOpportunities = opportunities.filter(op => 
    op.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    op.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 bg-gray-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunity Scanner</h1>
          <p className="text-gray-400 mt-1">Discover high-potential trading opportunities in real-time.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="mt-4 md:mt-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-lg hover:shadow-cyan-500/50 disabled:cursor-not-allowed"
        >
          {isScanning ? (
            <>
              <Loader className="animate-spin mr-2" size={20} />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw size={20} className="mr-2" />
              Scan for Opportunities
            </>
          )}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
          <ScannerFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
           <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
      </div>

      {/* Results */}
      <div className="transition-opacity duration-500 ease-in-out">
        {isScanning && (
          <div className="flex flex-col items-center justify-center text-center p-10">
            <Loader className="animate-spin text-cyan-500" size={48} />
            <p className="mt-4 text-lg font-semibold">Scanning Markets...</p>
            <p className="text-gray-400">Please wait while we analyze the latest data.</p>
          </div>
        )}

        {!isScanning && opportunities.length === 0 && (
           <div className="text-center py-16">
             <h3 className="text-2xl font-semibold">No Opportunities Found</h3>
             <p className="text-gray-400 mt-2">Click "Scan for Opportunities" to start a new analysis.</p>
           </div>
        )}
        
        {!isScanning && filteredOpportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOpportunities.map((op) => (
              <OpportunityCard key={op.symbol} opportunity={op} />
            ))}
          </div>
        )}

        {!isScanning && opportunities.length > 0 && filteredOpportunities.length === 0 && (
            <div className="text-center py-16">
                <h3 className="text-2xl font-semibold">No Matching Opportunities</h3>
                <p className="text-gray-400 mt-2">Try adjusting your search query or filters.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityScanner;
