
import React from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';

const PositionsList = ({ positions }) => {

  const calculateMetrics = (position) => {
    const marketValue = position.lastPrice * position.quantity;
    const totalCost = position.avgPrice * position.quantity;
    const gainLoss = marketValue - totalCost;
    const gainLossPercent = (gainLoss / totalCost) * 100;
    return { marketValue, gainLoss, gainLossPercent };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-900/50">
          <tr>
            <th scope="col" className="px-4 py-3">Symbol</th>
            <th scope="col" className="px-4 py-3">Last Price</th>
            <th scope="col" className="px-4 py-3">Quantity</th>
            <th scope="col" className="px-4 py-3">Market Value</th>
            <th scope="col" className="px-4 py-3">Gain/Loss</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => {
            const { marketValue, gainLoss, gainLossPercent } = calculateMetrics(pos);
            const isPositive = gainLoss >= 0;

            return (
              <tr key={pos.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="px-4 py-3 font-medium text-white">
                  <div className="flex flex-col">
                    <span className="font-bold">{pos.symbol}</span>
                    <span className="text-xs text-gray-400 truncate">{pos.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono">${pos.lastPrice.toFixed(2)}</td>
                <td className="px-4 py-3">{pos.quantity}</td>
                <td className="px-4 py-3 font-mono">${marketValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className={`px-4 py-3 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="flex items-center">
                    {isPositive ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                    <span>{gainLossPercent.toFixed(2)}%</span>
                  </div>
                  <div className="text-xs font-mono">(${gainLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PositionsList;
