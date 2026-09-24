import React from 'react';
import { DatePicker, Select } from '../../../common/Forms';

const ReportFilters = ({ filters, onFilterChange, activeReport, onReportChange }) => {
  const reportTypes = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'bonus', label: 'Bonus Report' },
    { value: 'payment', label: 'Payment Report' },
    { value: 'turnover', label: 'Turnover Report' },
    { value: 'bet', label: 'Bet Report' },
    { value: 'vip', label: 'VIP Point Report' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reports</h2>
        <Select
          name="reportType"
          value={activeReport}
          onChange={(e) => onReportChange(e.target.value)}
          options={reportTypes}
          className="w-48"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          label="Start Date"
          name="startDate"
          value={filters.startDate}
          onChange={(e) => onFilterChange({ startDate: e.target.value })}
        />
        <DatePicker
          label="End Date"
          name="endDate"
          value={filters.endDate}
          onChange={(e) => onFilterChange({ endDate: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ReportFilters; 