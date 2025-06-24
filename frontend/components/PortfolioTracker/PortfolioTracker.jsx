import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Plus, Trash2, Edit3, Eye } from 'lucide-react';

const PortfolioTracker = () => {
  const [portfolios, setPortfolios] = useState([
    {
      id: 1,
      name: 'المحفظة الرئيسية',
      totalValue: 125000,
      totalCost: 110000,
      totalGain: 15000,
      gainPercent: 13.64,
      positions: [
        { symbol: 'COMI', name: 'البنك التجاري الدولي', shares: 100, avgPrice: 58.50, currentPrice: 62.50, value: 6250, gain: 400 },
        { symbol: 'EFG', name: 'هيرميس القابضة', shares: 200, avgPrice: 14.25, currentPrice: 15.40, value: 3080, gain: 230 },
        { symbol: 'OREG', name: 'أوراسكوم للإنشاء', shares: 150, avgPrice: 22.10, currentPrice: 24.80, value: 3720, gain: 405 },
        { symbol: 'SWDY', name: 'السويدي إلكتريك', shares: 75, avgPrice: 38.20, currentPrice: 42.10, value: 3157.5, gain: 292.5 }
      ]
    }
  ]);

  const [selectedPortfolio, setSelectedPortfolio] = useState(portfolios[0]);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    shares: '',
    avgPrice: ''
  });

  // Portfolio metrics
  const currentPortfolio = portfolios.find(p => p.id === selectedPortfolio.id) || portfolios[0];
  const totalValue = currentPortfolio.positions.reduce((sum, pos) => sum + pos.value, 0);
  const totalGain = currentPortfolio.positions.reduce((sum, pos) => sum + pos.gain, 0);
  const gainPercent = ((totalGain / (totalValue - totalGain)) * 100);

  // Prepare chart data
  const portfolioDistribution = currentPortfolio.positions.map(pos => ({
    name: pos.symbol,
    value: pos.value,
    percentage: ((pos.value / totalValue) * 100).toFixed(1)
  }));

  const performanceData = currentPortfolio.positions.map(pos => ({
    symbol: pos.symbol,
    gain: pos.gain,
    gainPercent: ((pos.gain / (pos.value - pos.gain)) * 100).toFixed(1),
    value: pos.value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleAddPosition = () => {
    if (newPosition.symbol && newPosition.shares && newPosition.avgPrice) {
      const shares = parseFloat(newPosition.shares);
      const avgPrice = parseFloat(newPosition.avgPrice);
      const currentPrice = avgPrice * (1 + (Math.random() - 0.5) * 0.2); // Mock current price
      
      const position = {
        symbol: newPosition.symbol.toUpperCase(),
        name: `${newPosition.symbol} Company`,
        shares,
        avgPrice,
        currentPrice: Math.round(currentPrice * 100) / 100,
        value: shares * currentPrice,
        gain: shares * (currentPrice - avgPrice)
      };

      setPortfolios(prev => prev.map(portfolio => 
        portfolio.id === selectedPortfolio.id 
          ? { ...portfolio, positions: [...portfolio.positions, position] }
          : portfolio
      ));

      setNewPosition({ symbol: '', shares: '', avgPrice: '' });
      setShowAddPosition(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`${label}: ${payload[0].value?.toLocaleString()} EGP`}</p>
          <p className="text-slate-300 text-sm">{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">{currentPortfolio.name}</h2>
            <p className="text-slate-400">Portfolio Performance</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAddPosition(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Position</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Value</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-white text-2xl font-bold">{totalValue.toLocaleString()}</div>
            <div className="text-slate-400 text-sm">EGP</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Total Gain</span>
              {totalGain >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGain.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">EGP</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Gain %</span>
              <Percent className="w-4 h-4 text-yellow-400" />
            </div>
            <div className={`text-2xl font-bold ${gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Positions</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-white text-2xl font-bold">{currentPortfolio.positions.length}</div>
            <div className="text-slate-400 text-sm">Active</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4">Portfolio Distribution</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4">Position Performance</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="symbol" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="gain" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Current Positions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-300 pb-3">Symbol</th>
                <th className="text-left text-slate-300 pb-3">Name</th>
                <th className="text-right text-slate-300 pb-3">Shares</th>
                <th className="text-right text-slate-300 pb-3">Avg Price</th>
                <th className="text-right text-slate-300 pb-3">Current</th>
                <th className="text-right text-slate-300 pb-3">Value</th>
                <th className="text-right text-slate-300 pb-3">Gain/Loss</th>
                <th className="text-right text-slate-300 pb-3">%</th>
                <th className="text-right text-slate-300 pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPortfolio.positions.map((position, index) => {
                const gainPercent = ((position.gain / (position.value - position.gain)) * 100);
                return (
                  <tr key={index} className="border-b border-slate-700/50">
                    <td className="py-3 text-white font-medium">{position.symbol}</td>
                    <td className="py-3 text-slate-300">{position.name}</td>
                    <td className="py-3 text-right text-white">{position.shares}</td>
                    <td className="py-3 text-right text-white">{position.avgPrice.toFixed(2)}</td>
                    <td className="py-3 text-right text-white">{position.currentPrice.toFixed(2)}</td>
                    <td className="py-3 text-right text-white">{position.value.toLocaleString()}</td>
                    <td className={`py-3 text-right font-medium ${position.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.gain >= 0 ? '+' : ''}{position.gain.toFixed(2)}
                    </td>
                    <td className={`py-3 text-right font-medium ${gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-400 hover:text-blue-300 p-1">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      {showAddPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-bold mb-4">Add New Position</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Stock Symbol</label>
                <input
                  type="text"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="e.g., COMI"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Number of Shares</label>
                <input
                  type="number"
                  value={newPosition.shares}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, shares: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Average Price (EGP)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPosition.avgPrice}
                  onChange={(e) => setNewPosition(prev => ({ ...prev, avgPrice: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="58.50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddPosition(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPosition}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Position
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTracker;
