import React from 'react';
import Layout from '../components/Layout/Layout';
import TechnicalAnalysis from '../components/StockAnalyzer/TechnicalAnalysis';

const Analysis = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <TechnicalAnalysis />
        </div>
      </div>
    </Layout>
  );
};

export default Analysis;
