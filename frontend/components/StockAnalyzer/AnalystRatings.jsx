
import React from 'react';
import { ThumbsUp, ThumbsDown, Circle, Minus } from 'lucide-react';

const AnalystRatings = ({ data }) => {
  const { strongBuy, buy, hold, sell, strongSell, consensus, priceTarget } = data;
  const totalRatings = strongBuy + buy + hold + sell + strongSell;

  const getBarWidth = (rating) => {
    if (totalRatings === 0) return '0%';
    return `${(rating / totalRatings) * 100}%`;
  };

  const getConsensusColor = (c) => {
      switch(c.toLowerCase()) {
          case 'strong buy': return 'text-green-400';
          case 'buy': return 'text-green-500';
          case 'hold': return 'text-yellow-400';
          case 'sell': return 'text-red-500';
          case 'strong sell': return 'text-red-400';
          default: return 'text-gray-400';
      }
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <div>
                <p className="text-sm text-gray-400">Analyst Consensus</p>
                <p className={`text-lg font-bold ${getConsensusColor(consensus)}`}>{consensus}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400">Avg. Price Target</p>
                <p className="text-lg font-bold font-mono text-white">${priceTarget.toFixed(2)}</p>
            </div>
        </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className="w-24 text-gray-300">Strong Buy</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2.5 mx-2">
            <div className="bg-green-400 h-2.5 rounded-full" style={{ width: getBarWidth(strongBuy) }}></div>
          </div>
          <span className="w-8 text-right text-white">{strongBuy}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-gray-300">Buy</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2.5 mx-2">
            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: getBarWidth(buy) }}></div>
          </div>
          <span className="w-8 text-right text-white">{buy}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-gray-300">Hold</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2.5 mx-2">
            <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: getBarWidth(hold) }}></div>
          </div>
          <span className="w-8 text-right text-white">{hold}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-gray-300">Sell</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2.5 mx-2">
            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: getBarWidth(sell) }}></div>
          </div>
          <span className="w-8 text-right text-white">{sell}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 text-gray-300">Strong Sell</span>
          <div className="flex-1 bg-gray-700 rounded-full h-2.5 mx-2">
            <div className="bg-red-400 h-2.5 rounded-full" style={{ width: getBarWidth(strongSell) }}></div>
          </div>
          <span className="w-8 text-right text-white">{strongSell}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalystRatings;
