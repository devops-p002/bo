import React from 'react';
import { Card, Table } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const BetReport = ({ filters }) => {
  const { data, loading, error } = useReports('bet', filters);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'User', accessor: 'user' },
    { header: 'Game', accessor: 'game' },
    { header: 'Bet Amount', accessor: 'betAmount' },
    { header: 'Win Amount', accessor: 'winAmount' },
    { header: 'Result', accessor: 'result' },
    { header: 'Status', accessor: 'status' },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Bet Report</h2>
      <Table columns={columns} data={data} />
    </Card>
  );
};

export default BetReport; 