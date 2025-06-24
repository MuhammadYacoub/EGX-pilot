import { useState, useEffect } from 'react';
import TradingDashboard from '../components/TradingDashboard/TradingDashboard';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import OpportunityScanner from '../components/OpportunityScanner/OpportunityScanner';
import PortfolioTracker from '../components/PortfolioTracker/PortfolioTracker';
import StockAnalyzer from '../components/StockAnalyzer/StockAnalyzer';
import { useMarketData } from '../hooks/useMarketData';
// import { useToast } from '../hooks/use-toast'; // Will be implemented later

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStock, setSelectedStock] = useState(null);
  const { marketData, isConnected } = useMarketData();
  // const { toast } = useToast();

  // useEffect(() => {
  //   if (isConnected) {
  //     toast({
  //       title: "🟢 Market Data Connected",
  //       description: "Real-time EGX data stream active",
  //       duration: 3000,
  //     });
  //   }
  // }, [isConnected, toast]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'opportunities':
        return <OpportunityScanner onStockSelect={setSelectedStock} />;
      case 'portfolio':
        return <PortfolioTracker />;
      case 'analysis':
        return <StockAnalyzer selectedStock={selectedStock} />;
      default:
        // Assuming TradingDashboard is the main dashboard view
        return <TradingDashboard marketData={marketData} onStockSelect={setSelectedStock} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="flex h-screen">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            isConnected={isConnected} 
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
          />
          
          <main className="flex-1 overflow-auto p-6">
            {renderActiveView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
