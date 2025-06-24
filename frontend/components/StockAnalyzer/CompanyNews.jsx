import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';

const NewsItem = ({ news }) => (
  <div className="border-b border-gray-700/50 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
    <div className="flex justify-between items-start mb-2">
      <h4 className="text-sm font-semibold text-white leading-tight">{news.title}</h4>
      <ExternalLink size={14} className="text-gray-400 ml-2 flex-shrink-0" />
    </div>
    <div className="flex items-center text-xs text-gray-400">
      <span className="bg-gray-700 px-2 py-1 rounded mr-2">{news.source}</span>
      <Clock size={12} className="mr-1" />
      <span>{news.timestamp}</span>
    </div>
  </div>
);

const CompanyNews = ({ news }) => {
  if (!news || news.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No recent news available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <NewsItem key={item.id} news={item} />
      ))}
    </div>
  );
};

export default CompanyNews;
