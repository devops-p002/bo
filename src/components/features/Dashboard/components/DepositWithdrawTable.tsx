import React, { useState } from 'react';
import { Table } from '../../../common/UI';

const DepositWithdrawTable = ({ data = [], loading = false }) => {
  const [tableData] = useState(data || getDefaultData());
  
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold mr-3">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-gray-500 text-xs">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <div className={`font-medium ${row.type === 'Deposit' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type === 'Deposit' ? '+' : '-'}${value.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusClasses = {
          Completed: 'bg-green-100 text-green-800',
          Pending: 'bg-yellow-100 text-yellow-800',
          Failed: 'bg-red-100 text-red-800',
          Processing: 'bg-blue-100 text-blue-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[value] || ''}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
    },
  ];
  
  // Pagination setup
  const pagination = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    startItem: 1,
    endItem: 10,
    onPageChange: (page) => console.log(`Page changed to ${page}`),
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Deposits & Withdrawals</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Last 10 transactions by users</p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <Table 
          columns={columns} 
          data={tableData} 
          pagination={pagination} 
          loading={loading} 
          onRowClick={(row) => console.log('Row clicked:', row)}
        />
      </div>
    </div>
  );
};

// Default data for demonstration
function getDefaultData() {
  return [
    {
      id: 'TX1234567',
      username: 'john_doe',
      email: 'john@example.com',
      type: 'Deposit',
      amount: 500.00,
      status: 'Completed',
      date: '2023-05-15 14:30',
    },
    {
      id: 'TX1234568',
      username: 'alice_smith',
      email: 'alice@example.com',
      type: 'Withdrawal',
      amount: 200.00,
      status: 'Pending',
      date: '2023-05-15 15:45',
    },
    {
      id: 'TX1234569',
      username: 'bob_jones',
      email: 'bob@example.com',
      type: 'Deposit',
      amount: 1000.00,
      status: 'Completed',
      date: '2023-05-15 16:20',
    },
    {
      id: 'TX1234570',
      username: 'emma_wilson',
      email: 'emma@example.com',
      type: 'Withdrawal',
      amount: 350.00,
      status: 'Processing',
      date: '2023-05-14 09:15',
    },
    {
      id: 'TX1234571',
      username: 'mike_brown',
      email: 'mike@example.com',
      type: 'Deposit',
      amount: 750.00,
      status: 'Completed',
      date: '2023-05-14 11:30',
    },
    {
      id: 'TX1234572',
      username: 'sarah_taylor',
      email: 'sarah@example.com',
      type: 'Withdrawal',
      amount: 100.00,
      status: 'Failed',
      date: '2023-05-14 13:45',
    },
    {
      id: 'TX1234573',
      username: 'david_miller',
      email: 'david@example.com',
      type: 'Deposit',
      amount: 300.00,
      status: 'Completed',
      date: '2023-05-13 16:20',
    },
    {
      id: 'TX1234574',
      username: 'lisa_davis',
      email: 'lisa@example.com',
      type: 'Deposit',
      amount: 250.00,
      status: 'Pending',
      date: '2023-05-13 17:45',
    },
    {
      id: 'TX1234575',
      username: 'james_wilson',
      email: 'james@example.com',
      type: 'Withdrawal',
      amount: 500.00,
      status: 'Completed',
      date: '2023-05-12 10:30',
    },
    {
      id: 'TX1234576',
      username: 'jessica_martin',
      email: 'jessica@example.com',
      type: 'Deposit',
      amount: 1200.00,
      status: 'Completed',
      date: '2023-05-12 14:15',
    },
  ];
}

export default DepositWithdrawTable; 