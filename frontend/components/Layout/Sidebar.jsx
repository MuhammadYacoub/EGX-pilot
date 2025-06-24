import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Target, 
  Briefcase, 
  TrendingUp, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  User,
  LogOut,
  Calculator,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(router.pathname);

  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      labelAr: 'لوحة التحكم',
      href: '/'
    },
    {
      id: 'opportunities',
      icon: Target,
      label: 'Opportunities',
      labelAr: 'صائد الفرص',
      href: '/opportunities'
    },
    {
      id: 'portfolio',
      icon: Briefcase,
      label: 'Portfolio',
      labelAr: 'المحفظة',
      href: '/portfolio'
    },
    {
      id: 'analysis',
      icon: TrendingUp,
      label: 'Analysis',
      labelAr: 'التحليل',
      href: '/analysis'
    },
    {
      id: 'risk',
      icon: Calculator,
      label: 'Risk Calculator',
      labelAr: 'حاسبة المخاطر',
      href: '/risk'
    }
  ];

  const settingsItems = [
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      labelAr: 'الملف الشخصي'
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      labelAr: 'الإعدادات'
    }
  ];

  return (
    <aside className={`sidebar transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-64'
    } flex flex-col`}>
      
      {/* Header with Logo and Collapse Toggle */}
      <div className="p-4 border-b border-primary flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gradient arabic-text">
                EGXpilot
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-glass rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-secondary" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-secondary" />
            )}
          </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link 
            href={item.href} 
            key={item.id}
            className={`sidebar-item ${
              activeItem === item.href ? 'active' : ''
            }`}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="mr-4 font-medium arabic-text">{item.labelAr}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer with Settings and Profile */}
      <div className="px-4 py-4 border-t border-primary">
        {settingsItems.map((item) => (
           <a key={item.id} className="sidebar-item">
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="mr-4 font-medium arabic-text">{item.labelAr}</span>}
          </a>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
