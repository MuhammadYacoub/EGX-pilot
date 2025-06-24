import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, XCircle, Target, Zap } from 'lucide-react';

const TechnicalAnalysis = ({ symbol = 'COMI' }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [signals, setSignals] = useState([]);
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);

  // Mock technical analysis data
  useEffect(() => {
    const generateAnalysisData = () => {
      const basePrice = 62.50;
      const data = [];
      const now = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const price = basePrice + (Math.random() - 0.5) * 10 + Math.sin(i * 0.2) * 3;
        const volume = Math.random() * 100000 + 200000;
        
        data.push({
          date: date.toISOString().split('T')[0],
          price: Math.round(price * 100) / 100,
          volume: Math.round(volume),
          sma20: price * (0.98 + Math.random() * 0.04),
          sma50: price * (0.96 + Math.random() * 0.08),
          rsi: 30 + Math.random() * 40,
          macd: (Math.random() - 0.5) * 2,
          bollinger_upper: price * 1.05,
          bollinger_lower: price * 0.95
        });
      }
      
      return data;
    };

    const generateIndicators = () => ({
      rsi: {
        value: 67.34,
        signal: 'BUY',
        description: 'Approaching overbought territory but still bullish'
      },
      macd: {
        value: 1.23,
        signal: 'BUY',
        description: 'MACD above signal line indicating upward momentum'
      },
      stochastic: {
        value: 78.91,
        signal: 'HOLD',
        description: 'Overbought but momentum remains strong'
      },
      williams_r: {
        value: -24.56,
        signal: 'BUY',
        description: 'Williams %R indicates bullish momentum'
      },
      cci: {
        value: 145.67,
        signal: 'SELL',
        description: 'CCI above +100 suggests potential reversal'
      },
      adx: {
        value: 32.45,
        signal: 'STRONG',
        description: 'Strong trend strength confirmed'
      }
    });

    const generateSignals = () => [
      {
        id: 1,
        type: 'BUY',
        indicator: 'Golden Cross',
        strength: 'STRONG',
        description: 'SMA 20 crossed above SMA 50',
        timestamp: '2 hours ago',
        price: 62.30
      },
      {
        id: 2,
        type: 'SELL',
        indicator: 'RSI Overbought',
        strength: 'MODERATE',
        description: 'RSI approaching 70 level',
        timestamp: '1 hour ago',
        price: 62.45
      },
      {
        id: 3,
        type: 'HOLD',
        indicator: 'Volume Analysis',
        strength: 'WEAK',
        description: 'Below average volume detected',
        timestamp: '30 min ago',
        price: 62.50
      }
    ];

    setAnalysisData(generateAnalysisData());
    setIndicators(generateIndicators());
    setSignals(generateSignals());
    setLoading(false);
  }, [symbol, timeframe]);

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 bg-green-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/20';
      case 'HOLD': return 'text-yellow-400 bg-yellow-400/20';
      case 'STRONG': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-4 h-4" />;
      case 'SELL': return <TrendingDown className="w-4 h-4" />;
      case 'HOLD': return <Activity className="w-4 h-4" />;
      case 'STRONG': return <Zap className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getStrengthIcon = (strength) => {
    switch (strength) {
      case 'STRONG': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'MODERATE': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'WEAK': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  // Calculate overall signal
  const buySignals = Object.values(indicators).filter(ind => ind.signal === 'BUY').length;
  const sellSignals = Object.values(indicators).filter(ind => ind.signal === 'SELL').length;
  const holdSignals = Object.values(indicators).filter(ind => ind.signal === 'HOLD').length;
  
  const overallSignal = buySignals > sellSignals + holdSignals ? 'BUY' : 
                       sellSignals > buySignals + holdSignals ? 'SELL' : 'HOLD';

  const timeframes = ['5M', '15M', '1H', '4H', '1D', '1W'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-1">{`Date: ${label}`}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-white font-medium">
              {`${item.dataKey}: ${item.value?.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Technical Analysis - {symbol}</h2>
            <p className="text-slate-400">Advanced chart analysis and trading signals</p>
          </div>
          
          {/* Overall Signal */}
          <div className="text-right">
            <div className="text-slate-400 text-sm mb-1">Overall Signal</div>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getSignalColor(overallSignal)}`}>
              {getSignalIcon(overallSignal)}
              <span className="font-bold">{overallSignal}</span>
            </div>
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="flex space-x-2 mb-4">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeframe === tf
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Signal Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-medium">Buy Signals</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-green-400 text-2xl font-bold">{buySignals}</div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-medium">Hold Signals</span>
              <Activity className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-yellow-400 text-2xl font-bold">{holdSignals}</div>
          </div>
          
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-400 font-medium">Sell Signals</span>
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-red-400 text-2xl font-bold">{sellSignals}</div>
          </div>
        </div>
      </div>

      {/* Price Chart with Indicators */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Price Action & Moving Averages</h3>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analysisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} name="Price" />
              <Line type="monotone" dataKey="sma20" stroke="#10b981" strokeWidth={1} strokeDasharray="5 5" name="SMA 20" />
              <Line type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1} strokeDasharray="5 5" name="SMA 50" />
              <Line type="monotone" dataKey="bollinger_upper" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="2 2" name="BB Upper" />
              <Line type="monotone" dataKey="bollinger_lower" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="2 2" name="BB Lower" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technical Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(indicators).map(([key, indicator]) => (
          <div key={key} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold uppercase">{key.replace('_', ' ')}</h4>
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getSignalColor(indicator.signal)}`}>
                {getSignalIcon(indicator.signal)}
                <span>{indicator.signal}</span>
              </div>
            </div>
            <div className="text-white text-2xl font-bold mb-2">{indicator.value.toFixed(2)}</div>
            <p className="text-slate-400 text-sm">{indicator.description}</p>
          </div>
        ))}
      </div>

      {/* Recent Signals */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Recent Trading Signals</h3>
        <div className="space-y-3">
          {signals.map((signal) => (
            <div key={signal.id} className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg ${getSignalColor(signal.type)}`}>
                  {getSignalIcon(signal.type)}
                  <span className="font-medium">{signal.type}</span>
                </div>
                <div>
                  <div className="text-white font-medium">{signal.indicator}</div>
                  <div className="text-slate-400 text-sm">{signal.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-1">
                  {getStrengthIcon(signal.strength)}
                  <span className="text-slate-300 text-sm">{signal.strength}</span>
                </div>
                <div className="text-white font-medium">{signal.price} EGP</div>
                <div className="text-slate-400 text-sm">{signal.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Volume Analysis</h3>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysisData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
