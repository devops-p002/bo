import React from 'react';
import { Card } from './';

const StatsCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  description,
  onClick,
  className = '',
  iconClassName = '',
  valueClassName = '',
  isLoading = false,
}: any) => {
  // Change types and their corresponding colors
  const changeTypeClasses: Record<string, string> = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  };
  
  // Change icons based on type
  const changeIcon = {
    positive: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    ),
    negative: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    ),
    neutral: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"></path>
      </svg>
    ),
  };
  
  return (
    <Card
      className={`stats-card ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded my-2"></div>
            ) : (
              <p className={`text-2xl font-bold ${valueClassName}`}>{value}</p>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-full ${iconClassName || 'bg-primary-100 text-primary-600'}`}>
              {icon}
            </div>
          )}
        </div>
        
        {(change || description) && (
          <div className="mt-4">
            {change && (
              <div className="flex items-center">
                <span className={`flex items-center ${changeTypeClasses[changeType]}`}>
                  {changeIcon[changeType]}
                  <span className="ml-1 text-sm font-medium">{change}</span>
                </span>
                {description && <span className="ml-2 text-sm text-gray-500">{description}</span>}
              </div>
            )}
            {!change && description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard; 