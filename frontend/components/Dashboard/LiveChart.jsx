import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

const LiveChart = ({ symbol = 'EGX30', data, height = 300, showControls = true }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartType, setChartType] = useState('line');
  const [mockData, setMockData] = useState([]);

  // Generate mock data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const baseValue = 25600;
      const dataPoints = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const value = baseValue + (Math.random() - 0.5) * 200 + Math.sin(i * 0.1) * 150;
        const volume = Math.random() * 100000 + 50000;
        
        dataPoints.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(value * 100) / 100,
          volume: Math.round(volume),
          change: i === 23 ? 0 : Math.round((value - dataPoints[0]?.value || baseValue) * 100) / 100
        });
      }
      
      return dataPoints;
    };

    setMockData(generateMockData());
    
    // Update every 30 seconds with slight variations
    const interval = setInterval(() => {
      setMockData(prevData => {
        const newData = [...prevData];
        const lastPoint = newData[newData.length - 1];
        const newValue = lastPoint.value + (Math.random() - 0.5) * 20;
        
        // Add new point and remove old one
        newData.shift();
        newData.push({
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: Math.round(newValue * 100) / 100,
          volume: Math.round(Math.random() * 100000 + 50000),
          change: Math.round((newValue - prevData[0]?.value || 25600) * 100) / 100
        });
        
        return newData;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const latestData = mockData[mockData.length - 1];
  const isPositive = latestData?.change >= 0;

  const timeframes = [
    { key: '1D', label: '1D' },
    { key: '5D', label: '5D' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '1Y', label: '1Y' }
  ];

  const chartTypes = [
    { key: 'line', label: 'Line', icon: TrendingUp },
    { key: 'area', label: 'Area', icon: BarChart3 },
    { key: 'candle', label: 'Candle', icon: Activity }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-1">{`Time: ${label}`}</p>
          <p className="text-white font-medium">{`Price: ${data.value?.toLocaleString()} EGP`}</p>
          <p className={`text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {`Change: ${data.change >= 0 ? '+' : ''}${data.change} EGP`}
          </p>
          <p className="text-slate-400 text-sm">{`Volume: ${data.volume?.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: mockData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={12}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            fillOpacity={1}
            fill="url(#colorGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="time" 
          stroke="#9ca3af" 
          fontSize={12}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#9ca3af" 
          fontSize={12}
          domain={['dataMin - 50', 'dataMax + 50']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: isPositive ? "#10b981" : "#ef4444" }}
        />
      </LineChart>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-white text-xl font-bold">{symbol} Live Chart</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Live</span>
          </div>
        </div>
        
        {/* Current Price Display */}
        {latestData && (
          <div className="text-right">
            <div className="text-white text-2xl font-bold">
              {latestData.value?.toLocaleString()} EGP
            </div>
            <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{latestData.change} ({isPositive ? '+' : ''}{((latestData.change / (latestData.value - latestData.change)) * 100).toFixed(2)}%)
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between mb-4">
          {/* Timeframe Controls */}
          <div className="flex space-x-2">
            {timeframes.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeframe === tf.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Chart Type Controls */}
          <div className="flex space-x-2">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setChartType(type.key)}
                  className={`p-2 rounded transition-colors ${
                    chartType === type.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  title={type.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-slate-400 text-sm">Volume</div>
          <div className="text-white font-medium">
            {latestData?.volume?.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-slate-400 text-sm">High</div>
          <div className="text-white font-medium">
            {Math.max(...mockData.map(d => d.value))?.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-slate-400 text-sm">Low</div>
          <div className="text-white font-medium">
            {Math.min(...mockData.map(d => d.value))?.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChart;
