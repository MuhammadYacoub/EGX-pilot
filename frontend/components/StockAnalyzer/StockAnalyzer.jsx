import React from 'react';
import StockHeader from './StockHeader';
import AdvancedChart from './AdvancedChart';
import Financials from './Financials';
import AnalystRatings from './AnalystRatings';
import CompanyNews from './CompanyNews';
import CompanyProfile from './CompanyProfile';
import { BarChart, Newspaper, Building, Users, CandlestickChart, Info } from 'lucide-react';

// Mock Data for a selected stock
const mockStockData = {
  symbol: 'COMI',
  name: 'Commercial International Bank',
  lastPrice: 62.50,
  change: 1.25,
  changePercent: 2.04,
  marketCap: 125_000_000_000,
  volume: 5_200_000,
  avgVolume: 4_800_000,
  peRatio: 8.5,
  eps: 7.35,
  profile: {
    sector: 'Banking',
    industry: 'Banks - Regional',
    ceo: 'Mr. Hussein Abaza',
    website: 'https://www.cibeg.com',
    description: 'Commercial International Bank (Egypt) S.A.E. provides retail, corporate, and investment banking services in Egypt and internationally. The company operates through four segments: Corporate Banking, Investment Banking, Retail Banking, and Treasury.'
  },
  financials: {
    revenue: 45_000_000_000,
    netIncome: 15_000_000_000,
    earningsGrowth: 15.2, // percent
    roe: 22.5, // percent
  },
  ratings: {
    strongBuy: 8,
    buy: 12,
    hold: 5,
    sell: 1,
    strongSell: 0,
    consensus: 'Buy',
    priceTarget: 75.50
  },
  news: [
    { id: 1, source: 'Reuters', title: 'CIB reports strong Q2 earnings, beating estimates.', timestamp: '2 hours ago' },
    { id: 2, source: 'Bloomberg', title: 'Egypt\'s banking sector shows resilience amidst global uncertainty.', timestamp: '1 day ago' },
    { id: 3, source: 'Enterprise.press', title: 'CIB expands digital services to target new customer segments.', timestamp: '2 days ago' },
  ]
};

const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Icon size={22} className="mr-3 text-cyan-400"/>
            {title}
        </h2>
        {children}
    </div>
);

const StockAnalyzer = ({ selectedStock }) => {
  // In a real app, you would fetch data based on `selectedStock`. 
  // For now, we use mock data if no stock is selected.
  const stock = selectedStock || mockStockData;

  if (!stock) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
            <CandlestickChart size={64} className="mx-auto text-gray-600"/>
            <h2 className="mt-4 text-2xl font-semibold">Select a Stock to Analyze</h2>
            <p className="mt-1">Choose a stock from the dashboard or search to see its detailed analysis.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 text-white min-h-screen">
      <StockHeader stock={stock} />
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content (Chart and News) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Section icon={CandlestickChart} title="Price Chart">
                <AdvancedChart symbol={stock.symbol} />
            </Section>
            <Section icon={Newspaper} title="Recent News">
                <CompanyNews news={stock.news} />
            </Section>
        </div>

        {/* Side Content (Profile, Financials, Ratings) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Section icon={Building} title="Company Profile">
                <CompanyProfile profile={stock.profile} />
            </Section>
            <Section icon={BarChart} title="Key Financials">
                <Financials data={stock.financials} />
            </Section>
            <Section icon={Users} title="Analyst Ratings">
                <AnalystRatings data={stock.ratings} />
            </Section>
        </div>
      </div>
    </div>
  );
};

export default StockAnalyzer;
