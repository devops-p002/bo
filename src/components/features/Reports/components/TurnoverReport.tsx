import React from 'react';
import { Card, Table } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const TurnoverReport = ({ filters }) => {
  const { data, loading, error } = useReports('turnover', filters);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Backed by userBettingLeaderboard, which is per-user for the whole
  // period (not per-bet), so there's no backend bet count or per-game
  // breakdown to show - "Total Bets" was dropped and "Game" is an
  // aggregate placeholder.
  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'User', accessor: 'user' },
    { header: 'Game', accessor: 'game' },
    { header: 'Total Amount', accessor: 'totalAmount' },
    { header: 'Winnings', accessor: 'winnings' },
    { header: 'Net Result', accessor: 'netResult' },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Turnover Report</h2>
      <Table columns={columns} data={data} />
    </Card>
  );
};

export default TurnoverReport; 