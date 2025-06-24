import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Shield, TrendingDown, Calculator, Target, DollarSign, Percent, Activity } from 'lucide-react';

const RiskCalculator = () => {
  const [riskInputs, setRiskInputs] = useState({
    portfolioValue: 100000,
    positionSize: 20000,
    entryPrice: 62.50,
    stopLoss: 58.00,
    targetPrice: 70.00,
    timeHorizon: 30, // days
    volatility: 25, // percentage
    riskFreeRate: 8.5 // Egypt risk-free rate
  });

  const [riskMetrics, setRiskMetrics] = useState({});
  const [scenarios, setScenarios] = useState([]);
  const [riskProfile, setRiskProfile] = useState('moderate');

  // Calculate risk metrics
  useEffect(() => {
    const calculateRiskMetrics = () => {
      const { portfolioValue, positionSize, entryPrice, stopLoss, targetPrice, volatility, riskFreeRate } = riskInputs;
      
      // Position sizing calculations
      const positionPercent = (positionSize / portfolioValue) * 100;
      const riskPerShare = entryPrice - stopLoss;
      const rewardPerShare = targetPrice - entryPrice;
      const riskRewardRatio = rewardPerShare / riskPerShare;
      
      // Risk calculations
      const maxLoss = (riskPerShare / entryPrice) * positionSize;
      const maxGain = (rewardPerShare / entryPrice) * positionSize;
      const portfolioRisk = (maxLoss / portfolioValue) * 100;
      
      // Value at Risk (simplified)
      const dailyVol = volatility / Math.sqrt(252);
      const var95 = positionSize * 1.65 * dailyVol / 100; // 95% confidence
      const var99 = positionSize * 2.33 * dailyVol / 100; // 99% confidence
      
      // Sharpe ratio estimation
      const expectedReturn = (riskRewardRatio > 1 ? 15 : 8); // Simplified
      const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
      
      // Beta estimation (mock)
      const beta = 0.8 + Math.random() * 0.6; // Random beta between 0.8-1.4
      
      // Volatility-adjusted metrics
      const volatilityScore = volatility > 30 ? 'High' : volatility > 20 ? 'Medium' : 'Low';
      const riskScore = portfolioRisk > 5 ? 'High' : portfolioRisk > 2 ? 'Medium' : 'Low';
      
      return {
        positionPercent: positionPercent.toFixed(2),
        riskRewardRatio: riskRewardRatio.toFixed(2),
        maxLoss: maxLoss.toFixed(2),
        maxGain: maxGain.toFixed(2),
        portfolioRisk: portfolioRisk.toFixed(2),
        var95: var95.toFixed(2),
        var99: var99.toFixed(2),
        sharpeRatio: sharpeRatio.toFixed(2),
        beta: beta.toFixed(2),
        volatilityScore,
        riskScore,
        expectancy: ((riskRewardRatio * 0.6) - (1 * 0.4)).toFixed(2) // Assuming 60% win rate
      };
    };

    const generateScenarios = () => {
      const { entryPrice, volatility } = riskInputs;
      const scenarios = [];
      
      const scenarioTypes = [
        { name: 'Bull Market', probability: 30, priceChange: 0.15 },
        { name: 'Normal Market', probability: 40, priceChange: 0.05 },
        { name: 'Bear Market', probability: 20, priceChange: -0.10 },
        { name: 'Market Crash', probability: 10, priceChange: -0.25 }
      ];
      
      scenarioTypes.forEach(scenario => {
        const newPrice = entryPrice * (1 + scenario.priceChange);
        const pnl = (newPrice - entryPrice) * (riskInputs.positionSize / entryPrice);
        const portfolioPnl = (pnl / riskInputs.portfolioValue) * 100;
        
        scenarios.push({
          ...scenario,
          newPrice: newPrice.toFixed(2),
          pnl: pnl.toFixed(2),
          portfolioPnl: portfolioPnl.toFixed(2)
        });
      });
      
      return scenarios;
    };

    setRiskMetrics(calculateRiskMetrics());
    setScenarios(generateScenarios());
  }, [riskInputs]);

  const handleInputChange = (field, value) => {
    setRiskInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'High': return 'text-red-400 bg-red-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const riskProfileData = [
    { name: 'Conservative', allocation: 20, color: '#10b981' },
    { name: 'Moderate', allocation: 50, color: '#3b82f6' },
    { name: 'Aggressive', allocation: 30, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Risk Calculator Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">Risk Calculator</h2>
            <p className="text-slate-400">Advanced position sizing and risk management</p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="text-slate-300">Risk Analysis</span>
          </div>
        </div>

        {/* Risk Profile Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['conservative', 'moderate', 'aggressive'].map((profile) => (
            <button
              key={profile}
              onClick={() => setRiskProfile(profile)}
              className={`p-4 rounded-lg border transition-colors ${
                riskProfile === profile
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                  : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="text-lg font-medium capitalize">{profile}</div>
              <div className="text-sm opacity-75">
                {profile === 'conservative' && 'Low risk, stable returns'}
                {profile === 'moderate' && 'Balanced risk and reward'}
                {profile === 'aggressive' && 'High risk, high potential'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4">Risk Parameters</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Portfolio Value (EGP)</label>
                <input
                  type="number"
                  value={riskInputs.portfolioValue}
                  onChange={(e) => handleInputChange('portfolioValue', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Position Size (EGP)</label>
                <input
                  type="number"
                  value={riskInputs.positionSize}
                  onChange={(e) => handleInputChange('positionSize', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Entry Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskInputs.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Stop Loss</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskInputs.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Target Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={riskInputs.targetPrice}
                  onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Volatility (%)</label>
                <input
                  type="number"
                  value={riskInputs.volatility}
                  onChange={(e) => handleInputChange('volatility', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Time Horizon (days)</label>
                <input
                  type="number"
                  value={riskInputs.timeHorizon}
                  onChange={(e) => handleInputChange('timeHorizon', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Metrics Display */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4">Risk Metrics</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Position Size</div>
                <div className="text-white text-lg font-bold">{riskMetrics.positionPercent}%</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Risk/Reward</div>
                <div className="text-white text-lg font-bold">1:{riskMetrics.riskRewardRatio}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Max Loss</div>
                <div className="text-red-400 text-lg font-bold">-{riskMetrics.maxLoss} EGP</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Max Gain</div>
                <div className="text-green-400 text-lg font-bold">+{riskMetrics.maxGain} EGP</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Portfolio Risk</div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded ${getRiskColor(riskMetrics.riskScore)}`}>
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-sm font-medium">{riskMetrics.portfolioRisk}%</span>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Sharpe Ratio</div>
                <div className="text-white text-lg font-bold">{riskMetrics.sharpeRatio}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">VaR (95%)</div>
                <div className="text-orange-400 text-lg font-bold">{riskMetrics.var95} EGP</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Beta</div>
                <div className="text-white text-lg font-bold">{riskMetrics.beta}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Scenario Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scenarios Table */}
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-300 pb-3">Scenario</th>
                    <th className="text-right text-slate-300 pb-3">Probability</th>
                    <th className="text-right text-slate-300 pb-3">Price</th>
                    <th className="text-right text-slate-300 pb-3">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((scenario, index) => (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-3 text-white">{scenario.name}</td>
                      <td className="py-3 text-right text-slate-300">{scenario.probability}%</td>
                      <td className="py-3 text-right text-white">{scenario.newPrice}</td>
                      <td className={`py-3 text-right font-medium ${
                        parseFloat(scenario.pnl) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(scenario.pnl) >= 0 ? '+' : ''}{scenario.pnl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scenario Chart */}
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarios}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="pnl" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Profile Allocation */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-white text-lg font-bold mb-4">Recommended Risk Allocation</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskProfileData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, allocation }) => `${name} ${allocation}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="allocation"
                >
                  {riskProfileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-medium">Conservative</span>
                <span className="text-white">20%</span>
              </div>
              <div className="text-slate-400 text-sm">
                Low-risk investments like bonds and stable stocks
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 font-medium">Moderate</span>
                <span className="text-white">50%</span>
              </div>
              <div className="text-slate-400 text-sm">
                Balanced mix of growth and dividend stocks
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400 font-medium">Aggressive</span>
                <span className="text-white">30%</span>
              </div>
              <div className="text-slate-400 text-sm">
                High-growth stocks and speculative investments
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
