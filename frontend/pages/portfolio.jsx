import React from 'react';
import Layout from '../components/Layout/Layout';
import PortfolioTracker from '../components/PortfolioTracker/PortfolioTracker';

const Portfolio = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <PortfolioTracker />
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
