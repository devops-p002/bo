import React from 'react';
import { BonusIssueForm } from '../../components/features/Marketing/components/BonusIssueForm';
import { Breadcrumb } from '../../components/common/UI';
import { useTheme } from '../../context/ThemeContext';

const IssueBonusPage = () => {
  const { isDarkTheme } = useTheme();
  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <BonusIssueForm />
    </div>
  );
};

export default IssueBonusPage; 