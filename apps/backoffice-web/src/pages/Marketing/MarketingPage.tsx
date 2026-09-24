import React from 'react';
import Marketing from '../../components/features/Marketing';
import { Breadcrumb } from '../../components/common/UI';
import { useTheme } from '../../context/ThemeContext';

const MarketingPage = () => {
  const { isDarkTheme } = useTheme();
  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <Marketing />
    </div>
  );
};

export default MarketingPage;