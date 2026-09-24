import React from 'react';
import { Card, Table } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const DailyReport = ({ filters }) => {
  const { data, loading, error } = useReports('daily', filters);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // New/active user counts aren't tracked per-day by the backend, so those
  // columns were dropped rather than shown as permanently blank.
  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Total Turnover', accessor: 'totalTurnover' },
    { header: 'Total Winnings', accessor: 'totalWinnings' },
    { header: 'Net Revenue', accessor: 'netRevenue' },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Daily Report</h2>
      <Table columns={columns} data={data} />
    </Card>
  );
};

export default DailyReport; 