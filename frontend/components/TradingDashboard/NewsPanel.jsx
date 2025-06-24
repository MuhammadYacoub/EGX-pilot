import React from 'react';
import { ExternalLink } from 'lucide-react';

const NewsPanel = () => {
  // Dummy data for news articles
  const newsArticles = [
    {
      source: 'Reuters',
      title: 'البنك المركزي المصري يثبت أسعار الفائدة كما هو متوقع',
      time: 'منذ ساعتين',
      link: '#',
    },
    {
      source: 'Bloomberg',
      title: 'طلعت مصطفى تحقق ارتفاعاً بنسبة 45% في أرباح الربع الثاني',
      time: 'منذ 5 ساعات',
      link: '#',
    },
    {
      source: 'Enterprise',
      title: 'مؤشر EGX30 يرتفع لليوم الخامس على التوالي مدفوعاً بأسهم البنوك',
      time: 'منذ 8 ساعات',
      link: '#',
    },
    {
      source: 'Mubasher',
      title: 'أوراسكوم للإنشاءات تبني منشأة جديدة في العاصمة الإدارية الجديدة',
      time: 'منذ يوم',
      link: '#',
    },
     {
      source: 'Ahram Online',
      title: 'فيتش تؤكد تصنيف مصر عند B- مع نظرة مستقرة',
      time: 'منذ يومين',
      link: '#',
    },
  ];

  return (
    <div className="trading-card animate-fade-in">
      <h3 className="text-lg font-bold text-primary-text mb-4">أخبار السوق</h3>
      <ul className="space-y-4">
        {newsArticles.map((article, index) => (
          <li key={index} className="flex items-start justify-between hover:bg-glass p-2 rounded-lg transition-all duration-200">
            <div>
              <p className="text-sm font-semibold text-primary-text hover:text-primary transition-colors">
                <a href={article.link} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </p>
              <div className="text-xs text-secondary-text mt-1">
                <span>{article.source}</span>
                <span className="mx-2">•</span>
                <span>{article.time}</span>
              </div>
            </div>
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-secondary-text hover:text-primary transition-colors ml-4">
              <ExternalLink className="h-4 w-4" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsPanel;
