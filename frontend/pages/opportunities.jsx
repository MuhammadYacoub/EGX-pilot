import React from 'react';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import OpportunityScanner from '../components/OpportunityScanner/OpportunityScanner';

const Opportunities = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          <OpportunityScanner />
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
