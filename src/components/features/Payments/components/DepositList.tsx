import React, { useState, useEffect } from 'react';
import { Card, Table } from '../../../common/UI';
import { Input, Select, DatePicker } from '../../../common/Forms';
import usePayments from '../hooks/usePayments';

const DepositList = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { deposits, loading, error, fetchDeposits, updateDepositStatus } = usePayments();

  useEffect(() => {
    fetchDeposits(filters);
  }, [fetchDeposits, filters]);

  const columns = [
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'Member', accessor: 'memberUsername' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Method', accessor: 'paymentMethod' },
    { header: 'Status', accessor: 'status' },
    { header: 'Date', accessor: 'createdAt' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleStatusUpdate = async (depositId, newStatus) => {
    try {
      await updateDepositStatus(depositId, newStatus);
      fetchDeposits(filters);
    } catch (error) {
      console.error('Error updating deposit status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      expired: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderActions = (deposit) => (
    <div className="flex space-x-2">
      {deposit.status === 'pending' && (
        <>
          <button
            onClick={() => handleStatusUpdate(deposit.id, 'approved')}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(deposit.id, 'rejected')}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Reject
          </button>
        </>
      )}
      <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
        View
      </button>
    </div>
  );

  const processedData = deposits?.map(deposit => ({
    ...deposit,
    amount: `$${deposit.amount.toFixed(2)}`,
    status: getStatusBadge(deposit.status),
    actions: renderActions(deposit)
  })) || [];

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Deposit Management</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by member or transaction ID..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'processing', label: 'Processing' }
              ]}
            />
            <Select
              value={filters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'credit_card', label: 'Credit Card' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'e_wallet', label: 'E-Wallet' },
                { value: 'cryptocurrency', label: 'Cryptocurrency' }
              ]}
            />
            <DatePicker
              value={filters.dateFrom}
              onChange={(date) => handleFilterChange('dateFrom', date)}
              placeholder="From Date"
            />
            <DatePicker
              value={filters.dateTo}
              onChange={(date) => handleFilterChange('dateTo', date)}
              placeholder="To Date"
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Deposits</p>
              <p className="text-2xl font-bold text-blue-800">
                ${deposits?.reduce((sum, d) => sum + d.amount, 0).toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-800">
                {deposits?.filter(d => d.status === 'pending').length || 0}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-800">
                {deposits?.filter(d => d.status === 'approved').length || 0}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-800">
                {deposits?.filter(d => d.status === 'rejected').length || 0}
              </p>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Table
              columns={columns}
              data={processedData}
              onSort={handleSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

export default DepositList; 