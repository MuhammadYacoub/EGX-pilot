import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Sidebar from './Sidebar';
import ErrorBoundary from '../ErrorBoundary';

const Layout = ({ children, title = 'EGXpilot - المستشار المالي الذكي' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="EGXpilot - Smart Financial Advisor for Egyptian Stock Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ErrorBoundary>
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />
            
            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
};

export default Layout;
