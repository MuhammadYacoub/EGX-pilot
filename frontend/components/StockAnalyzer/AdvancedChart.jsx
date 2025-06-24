
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdvancedChart = ({ symbol }) => {
  // Mock chart data - in a real app this would come from an API
  const chartData = [
    { time: '09:30', price: 62.1 },
    { time: '10:00', price: 62.3 },
    { time: '10:30', price: 61.8 },
    { time: '11:00', price: 62.5 },
    { time: '11:30', price: 63.2 },
    { time: '12:00', price: 62.9 },
    { time: '12:30', price: 63.1 },
    { time: '13:00', price: 62.7 },
    { time: '13:30', price: 62.5 },
    { time: '14:00', price: 62.8 },
  ];

  return (
    <div className="h-[400px] rounded-lg bg-gray-900/50 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{symbol} - Intraday Chart</h3>
        <p className="text-sm text-gray-400">Live price movement (Demo data)</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
          />
          <YAxis 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={{ stroke: '#4b5563' }}
            tickLine={{ stroke: '#4b5563' }}
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#06b6d4' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdvancedChart;
