import React from 'react';
import { Card } from '../../components/common/UI';
import DailyReport from '../../components/features/Reports/components/DailyReport';

const DailyReportPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Daily Report</h1>
          <p className="mt-1 text-sm text-gray-600">
            Daily performance summary and key metrics
          </p>
        </div>
      </div>

      <Card className="p-6">
        <DailyReport filters={{}} />
      </Card>
    </div>
  );
};

export default DailyReportPage; 