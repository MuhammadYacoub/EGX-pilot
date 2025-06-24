import React from 'react';
import { Scan, Briefcase, BarChart2, Settings } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      icon: <Scan className="h-8 w-8 mx-auto mb-2 text-primary" />,
      label: 'فحص الفرص',
      labelEn: 'Scan Opportunities',
      description: 'العثور على أفكار تداول جديدة',
    },
    {
      icon: <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />,
      label: 'إدارة المحفظة',
      labelEn: 'Manage Portfolio',
      description: 'عرض وتتبع أصولك',
    },
    {
      icon: <BarChart2 className="h-8 w-8 mx-auto mb-2 text-primary" />,
      label: 'تحليل الأسهم',
      labelEn: 'Analyze Stocks',
      description: 'تحليل متعمق لأي سهم',
    },
    {
      icon: <Settings className="h-8 w-8 mx-auto mb-2 text-primary" />,
      label: 'تخصيص الإعدادات',
      labelEn: 'Customize Settings',
      description: 'تخصيص تجربتك',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {actions.map((action, index) => (
            <div 
              key={action.label} 
              className="trading-card text-center cursor-pointer group animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
                {action.icon}
                <p className="font-semibold text-primary arabic-text">{action.label}</p>
                <p className="text-xs text-muted mt-1 arabic-text">{action.description}</p>
            </div>
        ))}
    </div>
  );
};

export default QuickActions;
