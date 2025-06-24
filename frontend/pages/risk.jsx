import React from 'react';
import Layout from '../components/Layout/Layout';
import RiskCalculator from '../components/RiskCalculator/RiskCalculator';

const Risk = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <RiskCalculator />
        </div>
      </div>
    </Layout>
  );
};

export default Risk;
