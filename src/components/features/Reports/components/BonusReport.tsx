import React from 'react';
import { Card, Table } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const BonusReport = ({ filters }) => {
  const { data, loading, error } = useReports('bonus', filters);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Bonus Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Issued To', accessor: 'issuedTo' },
    { header: 'Status', accessor: 'status' },
    { header: 'Wagered', accessor: 'wagered' },
    { header: 'Remaining', accessor: 'remaining' },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Bonus Report</h2>
      <Table columns={columns} data={data} />
    </Card>
  );
};

export default BonusReport; 