import React, { useState } from 'react';
import { Card, Table, Button } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const VIPPointReport = ({ filters = {} }) => {
  const { reports, loading, error, fetchReports } = useReports();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const vipPointData = [
    {
      id: 1,
      playerId: 'PLR001',
      playerName: 'John Doe',
      vipLevel: 'Gold',
      pointsEarned: 1250,
      pointsSpent: 800,
      pointsBalance: 450,
      lastActivity: '2024-06-15',
    },
    {
      id: 2,
      playerId: 'PLR002',
      playerName: 'Jane Smith',
      vipLevel: 'Platinum',
      pointsEarned: 2100,
      pointsSpent: 1500,
      pointsBalance: 600,
      lastActivity: '2024-06-14',
    },
    {
      id: 3,
      playerId: 'PLR003',
      playerName: 'Mike Johnson',
      vipLevel: 'Diamond',
      pointsEarned: 3500,
      pointsSpent: 2200,
      pointsBalance: 1300,
      lastActivity: '2024-06-15',
    },
  ];

  const columns = [
    {
      header: 'Player ID',
      accessor: 'playerId',
      sortable: true,
    },
    {
      header: 'Player Name',
      accessor: 'playerName',
      sortable: true,
    },
    {
      header: 'VIP Level',
      accessor: 'vipLevel',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value === 'Diamond' ? 'bg-purple-100 text-purple-800' :
          value === 'Platinum' ? 'bg-gray-100 text-gray-800' :
          value === 'Gold' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Points Earned',
      accessor: 'pointsEarned',
      sortable: true,
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      header: 'Points Spent',
      accessor: 'pointsSpent',
      sortable: true,
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      header: 'Points Balance',
      accessor: 'pointsBalance',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-green-600">
          {value?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      header: 'Last Activity',
      accessor: 'lastActivity',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleExport = () => {
    // Export functionality
    console.log('Exporting VIP Point Report...');
  };

  const totalPointsEarned = vipPointData.reduce((sum, item) => sum + item.pointsEarned, 0);
  const totalPointsSpent = vipPointData.reduce((sum, item) => sum + item.pointsSpent, 0);
  const totalPointsBalance = vipPointData.reduce((sum, item) => sum + item.pointsBalance, 0);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading VIP Point Report...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading VIP Point Report: {error}</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {totalPointsEarned.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points Earned</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold text-red-600">
              {totalPointsSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points Spent</div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-2xl font-bold text-blue-600">
              {totalPointsBalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Points Balance</div>
          </div>
        </Card>
      </div>

      {/* Report Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">VIP Points Report</h3>
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <Button onClick={handleExport} variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
          
          <Table
            data={vipPointData}
            columns={columns}
            pagination={true}
            pageSize={10}
            sortable={true}
            searchable={true}
            searchPlaceholder="Search players..."
          />
        </div>
      </Card>
    </div>
  );
};

export default VIPPointReport; 