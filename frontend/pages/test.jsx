import React, { useState } from 'react';
import { stocksAPI, opportunitiesAPI, authAPI } from '../utils/api';

const TestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testAPI = async (apiName, apiCall) => {
    setLoading(prev => ({ ...prev, [apiName]: true }));
    try {
      const response = await apiCall();
      setResults(prev => ({ 
        ...prev, 
        [apiName]: { 
          success: true, 
          data: response.data,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [apiName]: { 
          success: false, 
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [apiName]: false }));
    }
  };

  const tests = [
    {
      name: 'stocks',
      label: 'Get All Stocks',
      call: () => stocksAPI.getAll({ limit: 5 })
    },
    {
      name: 'stock-detail',
      label: 'Get Stock Detail (COMI)',
      call: () => stocksAPI.getBySymbol('COMI')
    },
    {
      name: 'sectors',
      label: 'Get Sectors',
      call: () => stocksAPI.getSectors()
    },
    {
      name: 'opportunities',
      label: 'Get Opportunities',
      call: () => opportunitiesAPI.getCurrent()
    },
    {
      name: 'search',
      label: 'Search Stocks (CIB)',
      call: () => stocksAPI.search('CIB', 3)
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">API Testing Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {tests.map((test) => (
            <button
              key={test.name}
              onClick={() => testAPI(test.name, test.call)}
              disabled={loading[test.name]}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 hover:border-primary/50 transition-colors disabled:opacity-50"
            >
              <div className="text-white font-medium mb-2">{test.label}</div>
              {loading[test.name] && (
                <div className="text-primary text-sm">Loading...</div>
              )}
              {results[test.name] && (
                <div className={`text-sm ${results[test.name].success ? 'text-positive' : 'text-negative'}`}>
                  {results[test.name].success ? '✓ Success' : '✗ Failed'}
                  <div className="text-slate-400 text-xs mt-1">
                    {results[test.name].timestamp}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Results Display */}
        <div className="space-y-6">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-lg font-bold capitalize">{testName.replace('-', ' ')}</h3>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  result.success ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'
                }`}>
                  {result.success ? 'Success' : 'Failed'}
                </div>
              </div>
              
              {result.success ? (
                <pre className="bg-slate-900/50 p-4 rounded-lg overflow-auto text-slate-300 text-sm">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              ) : (
                <div className="bg-negative/10 border border-negative/30 rounded-lg p-4">
                  <div className="text-negative font-medium mb-2">Error:</div>
                  <div className="text-slate-300 text-sm">{result.error}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Backend Status */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4">Backend Server Status</h3>
          <button
            onClick={() => testAPI('health', () => fetch('http://localhost:5000/health').then(r => r.json()))}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:scale-105 transition-transform"
          >
            Check Backend Health
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
