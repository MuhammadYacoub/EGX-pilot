import React, { useState, useEffect } from 'react';
import { Search, Bell, Wifi, WifiOff, Clock, Globe } from 'lucide-react';

const Header = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const marketStatus = {
    isOpen: true,
    nextClose: "15:00",
    timezone: "Cairo"
  };

  return (
    <header className="bg-secondary border-b border-primary/20 text-primary-text p-4 backdrop-blur-md">
      <div className="flex justify-between items-center">
        {/* Left Section - Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text h-5 w-5" />
          <input 
            type="text" 
            placeholder="البحث عن الأسهم... (مثل: COMI)"
            className="bg-glass text-primary-text pl-10 pr-4 py-2 rounded-full border border-primary/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary w-80 transition-all placeholder-secondary-text"
          />
        </div>

        {/* Right Section - Status & Controls */}
        <div className="flex items-center space-x-6">
          {/* Market Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
            <span className="text-sm font-medium">
              البورصة المصرية {marketStatus.isOpen ? 'مفتوحة' : 'مغلقة'}
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-success" />
            ) : (
              <WifiOff className="h-5 w-5 text-danger" />
            )}
            <span className="text-sm text-secondary-text">
              {isConnected ? 'مباشر' : 'غير متصل'}
            </span>
          </div>

          {/* Language Toggle */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-glass hover:bg-primary/20 rounded-lg transition-all duration-200 hover:scale-105">
            <Globe className="h-5 w-5 text-secondary-text" />
            <span className="text-sm font-medium">عربي</span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-glass rounded-full transition-all duration-200 hover:scale-105">
            <Bell className="h-6 w-6 text-secondary-text hover:text-primary transition-colors" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-danger rounded-full border-2 border-secondary animate-pulse"></div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
