
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="label text-gray-300">{`${label}`}</p>
        <p className="intro text-cyan-400 font-bold font-mono">{`$${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ data }) => {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
  }));

  const isPositive = chartData[chartData.length - 1].value >= chartData[0].value;
  const strokeColor = isPositive ? '#22c55e' : '#ef4444'; // green-500 or red-500
  const gradientColor = isPositive ? 'url(#colorUv)' : 'url(#colorPv)';

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#9ca3af' }} // gray-400
            axisLine={{ stroke: '#4b5563' }} // gray-600
            tickLine={{ stroke: '#4b5563' }} // gray-600
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000)}k`}
            tick={{ fill: '#9ca3af' }} // gray-400
            axisLine={{ stroke: '#4b5563' }} // gray-600
            tickLine={{ stroke: '#4b5563' }} // gray-600
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor}
            strokeWidth={2}
            fillOpacity={1}
            fill={gradientColor}
            dot={{ r: 4, fill: strokeColor, strokeWidth: 2, stroke: '#1f2937' }} // bg-gray-800
            activeDot={{ r: 6, fill: strokeColor, stroke: '#06b6d4' }} // cyan-500
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
