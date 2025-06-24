import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LiveChart = ({ symbol = 'EGX30' }) => {
  // Mock real-time data - in a real app this would come from a WebSocket or API
  const chartData = [
    { time: '09:30', price: 18_450 },
    { time: '10:00', price: 18_520 },
    { time: '10:30', price: 18_480 },
    { time: '11:00', price: 18_650 },
    { time: '11:30', price: 18_720 },
    { time: '12:00', price: 18_690 },
    { time: '12:30', price: 18_800 },
    { time: '13:00', price: 18_750 },
    { time: '13:30', price: 18_850 },
    { time: '14:00', price: 18_920 },
    { time: '14:30', price: 18_950 },
    { time: '15:00', price: 19_050 },
  ];

  return (
    <div className="trading-card h-[450px] animate-fade-in">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary-text">
          {symbol} مؤشر
        </h3>
        <p className="text-sm text-secondary-text">بيانات السوق المباشرة (تجريبي)</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-primary)' }}
            tickLine={{ stroke: 'var(--border-primary)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border-primary)' }}
            tickLine={{ stroke: 'var(--border-primary)' }}
            domain={['dataMin - 100', 'dataMax + 100']}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
            formatter={(value) => [value.toLocaleString(), 'السعر']}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="var(--primary)" 
            strokeWidth={2}
            dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: 'var(--primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LiveChart;
