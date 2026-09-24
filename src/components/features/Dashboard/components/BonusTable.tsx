import React, { useState } from 'react';
import { Table } from '../../../common/UI';

const BonusTable = ({ data = [], loading = false }) => {
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
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold mr-3">
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
      key: 'bonusType',
      label: 'Bonus Type',
      sortable: true,
      render: (value) => {
        const typeClasses = {
          'Welcome': 'bg-green-100 text-green-800',
          'Deposit': 'bg-blue-100 text-blue-800',
          'Reload': 'bg-purple-100 text-purple-800',
          'Birthday': 'bg-pink-100 text-pink-800',
          'VIP': 'bg-yellow-100 text-yellow-800',
          'Loyalty': 'bg-indigo-100 text-indigo-800',
          'Referral': 'bg-teal-100 text-teal-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeClasses[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value) => (
        <div className="font-medium text-green-600">
          ${value.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusClasses = {
          'Active': 'bg-green-100 text-green-800',
          'Pending': 'bg-yellow-100 text-yellow-800',
          'Completed': 'bg-blue-100 text-blue-800',
          'Expired': 'bg-red-100 text-red-800',
          'Cancelled': 'bg-gray-100 text-gray-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[value] || ''}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      sortable: true,
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Bonuses</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Last 10 bonuses issued to users</p>
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
      id: 'B1001',
      username: 'john_doe',
      email: 'john@example.com',
      bonusType: 'Welcome',
      amount: 50.00,
      status: 'Active',
      issueDate: '2023-05-15 14:30',
      expiryDate: '2023-05-22 14:30',
    },
    {
      id: 'B1002',
      username: 'alice_smith',
      email: 'alice@example.com',
      bonusType: 'Deposit',
      amount: 100.00,
      status: 'Active',
      issueDate: '2023-05-15 15:45',
      expiryDate: '2023-05-29 15:45',
    },
    {
      id: 'B1003',
      username: 'bob_jones',
      email: 'bob@example.com',
      bonusType: 'Reload',
      amount: 75.00,
      status: 'Pending',
      issueDate: '2023-05-15 16:20',
      expiryDate: '2023-05-22 16:20',
    },
    {
      id: 'B1004',
      username: 'emma_wilson',
      email: 'emma@example.com',
      bonusType: 'Birthday',
      amount: 25.00,
      status: 'Active',
      issueDate: '2023-05-14 09:15',
      expiryDate: '2023-05-21 09:15',
    },
    {
      id: 'B1005',
      username: 'mike_brown',
      email: 'mike@example.com',
      bonusType: 'VIP',
      amount: 200.00,
      status: 'Active',
      issueDate: '2023-05-14 11:30',
      expiryDate: '2023-05-28 11:30',
    },
    {
      id: 'B1006',
      username: 'sarah_taylor',
      email: 'sarah@example.com',
      bonusType: 'Referral',
      amount: 30.00,
      status: 'Expired',
      issueDate: '2023-05-14 13:45',
      expiryDate: '2023-05-14 13:45',
    },
    {
      id: 'B1007',
      username: 'david_miller',
      email: 'david@example.com',
      bonusType: 'Loyalty',
      amount: 50.00,
      status: 'Completed',
      issueDate: '2023-05-13 16:20',
      expiryDate: '2023-05-20 16:20',
    },
    {
      id: 'B1008',
      username: 'lisa_davis',
      email: 'lisa@example.com',
      bonusType: 'Deposit',
      amount: 150.00,
      status: 'Active',
      issueDate: '2023-05-13 17:45',
      expiryDate: '2023-05-27 17:45',
    },
    {
      id: 'B1009',
      username: 'james_wilson',
      email: 'james@example.com',
      bonusType: 'Reload',
      amount: 100.00,
      status: 'Cancelled',
      issueDate: '2023-05-12 10:30',
      expiryDate: '2023-05-19 10:30',
    },
    {
      id: 'B1010',
      username: 'jessica_martin',
      email: 'jessica@example.com',
      bonusType: 'VIP',
      amount: 250.00,
      status: 'Active',
      issueDate: '2023-05-12 14:15',
      expiryDate: '2023-05-26 14:15',
    },
  ];
}

export default BonusTable; 