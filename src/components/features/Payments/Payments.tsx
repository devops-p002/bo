import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Card } from '../../common/UI';
import DepositList from './components/DepositList';
import WithdrawalList from './components/WithdrawalList';
import PaymentMethods from './components/PaymentMethods';
import TransactionHistory from './components/TransactionHistory';
import PaymentFilters from './components/PaymentFilters';

const GET_PAYMENT_STATS = gql`
  query PaymentsQuickStats {
    dashboardStats {
      totalDeposits
      totalWithdrawals
      pendingTransactions
      revenue
    }
  }
`;

const Payments = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const { data: statsData, loading: statsLoading } = useQuery(GET_PAYMENT_STATS, { fetchPolicy: 'cache-and-network' });
  const stats = statsData?.dashboardStats;
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    amountFrom: '',
    amountTo: '',
    memberType: 'all',
    vipLevel: 'all',
    riskLevel: 'all',
    currency: 'all'
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      method: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
      amountFrom: '',
      amountTo: '',
      memberType: 'all',
      vipLevel: 'all',
      riskLevel: 'all',
      currency: 'all'
    });
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through state changes
    console.log('Filters applied:', filters);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'deposits':
        return <DepositList />;
      case 'withdrawals':
        return <WithdrawalList />;
      case 'methods':
        return <PaymentMethods />;
      case 'history':
        return <TransactionHistory />;
      default:
        return <DepositList />;
    }
  };

  const tabs = [
    { id: 'deposits', label: 'Deposits', icon: '💰' },
    { id: 'withdrawals', label: 'Withdrawals', icon: '💸' },
    { id: 'methods', label: 'Payment Methods', icon: '💳' },
    { id: 'history', label: 'Transaction History', icon: '📊' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payments Management</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Settings
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="p-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <PaymentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>

      {/* Quick Stats */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Quick Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Total Deposits</p>
              <p className="text-2xl font-bold text-green-800">
                {statsLoading ? '…' : `$${(stats?.totalDeposits ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">Total Withdrawals</p>
              <p className="text-2xl font-bold text-red-800">
                {statsLoading ? '…' : `$${(stats?.totalWithdrawals ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Pending Transactions</p>
              <p className="text-2xl font-bold text-yellow-800">
                {statsLoading ? '…' : (stats?.pendingTransactions ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-yellow-600">Requires attention</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Net Flow</p>
              <p className="text-2xl font-bold text-blue-800">
                {statsLoading ? '…' : `$${(stats?.revenue ?? 0).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Payments; 