import React from 'react';
import { Card, Breadcrumb } from '../../common/UI';
import { useTheme } from '../../../context/ThemeContext';
import {
  BonusReport,
  PaymentReport,
  TurnoverReport,
  BetReport,
  DailyReport,
  VIPPointReport,
  ReportFilters,
} from './components';

const Reports = () => {
  const { isDarkTheme } = useTheme();
  const [activeReport, setActiveReport] = React.useState('daily');
  const [filters, setFilters] = React.useState({
    startDate: '',
    endDate: '',
    type: 'daily',
  });

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const renderReport = () => {
    switch (activeReport) {
      case 'bonus':
        return <BonusReport filters={filters} />;
      case 'payment':
        return <PaymentReport filters={filters} />;
      case 'turnover':
        return <TurnoverReport filters={filters} />;
      case 'bet':
        return <BetReport filters={filters} />;
      case 'vip':
        return <VIPPointReport filters={filters} />;
      case 'daily':
      default:
        return <DailyReport filters={filters} />;
    }
  };

  return (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="mb-3">
        <Breadcrumb />
      </div>
      <div className="space-y-6">
      <Card>
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          activeReport={activeReport}
          onReportChange={setActiveReport}
        />
      </Card>
      {renderReport()}
      </div>
    </div>
  );
};

export default Reports;