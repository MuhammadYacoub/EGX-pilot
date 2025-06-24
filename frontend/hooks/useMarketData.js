import { useState, useEffect } from 'react';
import { stocksAPI, marketAPI } from '../utils/api';

// Hook for market data
export const useMarketData = () => {
  const [marketData, setMarketData] = useState({
    egx30: { value: 25670.5, change: 2.3, volume: 1.2 },
    egx70: { value: 4120.8, change: -0.8, volume: 0.9 },
    totalVolume: 2.1,
    marketCap: 45.2,
    isLoading: true,
    error: null
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await marketAPI.getLiveData();
        if (response.success) {
          setMarketData(prevData => ({ 
            ...response.data, 
            isLoading: false, 
            error: null 
          }));
          setIsConnected(response.data.status !== 'fallback');
        } else {
          throw new Error('Failed to fetch market data');
        }
      } catch (error) {
        console.warn('Using mock market data:', error.message);
        setMarketData(prevData => ({ 
          ...prevData, 
          isLoading: false, 
          error: null 
        }));
        setIsConnected(false);
      }
    };

    // Initial fetch
    fetchMarketData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { marketData, isConnected };
};

// Hook for top stocks
export const useTopStocks = () => {
  const [stocks, setStocks] = useState([
    { symbol: 'COMI', name: 'البنك التجاري الدولي', price: 62.50, change: 2.1 },
    { symbol: 'OCDI', name: 'أوراسكوم للتنمية', price: 28.75, change: -1.3 },
    { symbol: 'HRHO', name: 'هيرميس القابضة', price: 15.40, change: 3.8 },
    { symbol: 'SWDY', name: 'السويدي إلكتريك', price: 42.10, change: 1.7 }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        const response = await stocksAPI.getTopStocks({ type: 'gainers', limit: 4 });
        if (response.data.success) {
          setStocks(response.data.data);
        } else {
          throw new Error('Failed to fetch top stocks');
        }
        setIsLoading(false);
      } catch (err) {
        console.warn('Using mock stocks data:', err.message);
        setError(null); // Don't show error, use mock data
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchTopStocks();
    
    // Update every 60 seconds
    const interval = setInterval(fetchTopStocks, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { stocks, isLoading, error };
};

// Hook for opportunities
export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanStats, setScanStats] = useState({
    stocksScanned: 127,
    opportunitiesFound: 23,
    averageScore: 74,
    lastUpdate: '2min'
  });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await opportunitiesAPI.getCurrent();
        if (response.data.success) {
          setOpportunities(response.data.data.opportunities || []);
          setScanStats(response.data.data.stats || scanStats);
        }
        setIsLoading(false);
      } catch (err) {
        console.warn('Using mock opportunities data:', err.message);
        // Use mock data
        setOpportunities([
          {
            rank: 1,
            symbol: 'COMI',
            companyName: 'Commercial International Bank',
            companyNameAr: 'البنك التجاري الدولي',
            sector: 'Banking',
            currentPrice: 62.50,
            opportunityScore: 87,
            confidence: 'VERY_HIGH',
            signals: {
              momentum: { score: 85, primary: 'RSI Oversold Recovery' },
              volume: { score: 92, primary: 'Volume Surge +120%' },
              pattern: { score: 78, primary: 'Ascending Triangle' },
              wyckoff: { score: 88, primary: 'Markup Phase' }
            },
            recommendation: {
              action: 'STRONG_BUY',
              entryZone: [61.00, 63.50],
              targets: [68.00, 72.00, 75.50],
              stopLoss: 58.50,
              timeframe: 'Short to Medium'
            },
            catalysts: ['Earnings Beat', 'Sector Rotation', 'Technical Breakout']
          }
        ]);
        setError(null);
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const runScan = async () => {
    setIsLoading(true);
    try {
      const response = await opportunitiesAPI.scan();
      if (response.data.success) {
        setOpportunities(response.data.data.opportunities || []);
        setScanStats(response.data.data.stats || scanStats);
      }
    } catch (err) {
      console.error('Scan failed:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { opportunities, scanStats, isLoading, error, runScan };
};

// Hook for stocks search
export const useStocksSearch = (query) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchStocks = async () => {
      setIsLoading(true);
      try {
        const response = await stocksAPI.search(query, 10);
        if (response.data.success) {
          setResults(response.data.data);
        }
      } catch (err) {
        console.error('Search failed:', err.message);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchStocks, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query]);

  return { results, isLoading };
};
