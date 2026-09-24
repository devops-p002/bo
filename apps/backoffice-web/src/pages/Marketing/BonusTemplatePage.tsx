import React from 'react';
import { BonusTemplateForm } from '../../components/features/Marketing/components/BonusTemplateForm';
import { Breadcrumb } from '../../components/common/UI';
import { useTheme } from '../../context/ThemeContext';

const BonusTemplatePage = () => {
  const { isDarkTheme } = useTheme();
  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <BonusTemplateForm />
    </div>
  );
};

export default BonusTemplatePage;