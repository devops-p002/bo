import React, { useState, useEffect } from 'react';
import { Card, Table } from '../../../common/UI';
import { Input, Select, DatePicker } from '../../../common/Forms';
import useTransactions from '../hooks/useTransactions';

const TransactionHistory = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    method: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
    amountFrom: '',
    amountTo: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { transactions, loading, error, fetchTransactions, exportTransactions } = useTransactions();

  useEffect(() => {
    fetchTransactions(filters);
  }, [fetchTransactions, filters]);

  const columns = [
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'Type', accessor: 'type' },
    { header: 'Member', accessor: 'memberUsername' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Method', accessor: 'paymentMethod' },
    { header: 'Status', accessor: 'status' },
    { header: 'Date', accessor: 'createdAt' },
    { header: 'Reference', accessor: 'reference' }
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

  const handleExport = async () => {
    try {
      await exportTransactions(filters);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      deposit: 'bg-green-100 text-green-800',
      withdrawal: 'bg-red-100 text-red-800',
      bonus: 'bg-purple-100 text-purple-800',
      refund: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const processedData = transactions?.map(transaction => ({
    ...transaction,
    type: getTypeBadge(transaction.type),
    amount: `$${transaction.amount.toFixed(2)}`,
    status: getStatusBadge(transaction.status),
    createdAt: new Date(transaction.createdAt).toLocaleDateString()
  })) || [];

  const getTotalAmount = (type) => {
    return transactions
      ?.filter(t => type === 'all' || t.type === type)
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Transaction History</h2>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Export CSV
            </button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input
              type="text"
              placeholder="Search by member or transaction ID..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'deposit', label: 'Deposits' },
                { value: 'withdrawal', label: 'Withdrawals' },
                { value: 'bonus', label: 'Bonuses' },
                { value: 'refund', label: 'Refunds' }
              ]}
            />
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' },
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
          </div>

          {/* Date and Amount Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
            <Input
              type="number"
              placeholder="Min Amount"
              value={filters.amountFrom}
              onChange={(e) => handleFilterChange('amountFrom', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Amount"
              value={filters.amountTo}
              onChange={(e) => handleFilterChange('amountTo', e.target.value)}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-600">Total Volume</p>
              <p className="text-2xl font-bold text-blue-800">
                ${getTotalAmount('all').toFixed(2)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-green-600">Deposits</p>
              <p className="text-2xl font-bold text-green-800">
                ${getTotalAmount('deposit').toFixed(2)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <p className="text-sm text-red-600">Withdrawals</p>
              <p className="text-2xl font-bold text-red-800">
                ${getTotalAmount('withdrawal').toFixed(2)}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <p className="text-sm text-purple-600">Bonuses</p>
              <p className="text-2xl font-bold text-purple-800">
                ${getTotalAmount('bonus').toFixed(2)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">
                {transactions?.length || 0}
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

export default TransactionHistory; 