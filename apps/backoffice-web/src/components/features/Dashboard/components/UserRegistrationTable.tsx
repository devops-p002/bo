import React, { useState } from 'react';
import { Table } from '../../../common/UI';

const UserRegistrationTable = ({ data = [], loading = false }) => {
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
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold mr-3">
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusClasses = {
          Active: 'bg-green-100 text-green-800',
          Pending: 'bg-yellow-100 text-yellow-800',
          Suspended: 'bg-red-100 text-red-800',
          Verifying: 'bg-blue-100 text-blue-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[value] || ''}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
    },
    {
      key: 'registrationDate',
      label: 'Registration Date',
      sortable: true,
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (value) => {
        const sourceClasses = {
          'Direct': 'bg-gray-100 text-gray-800',
          'Referral': 'bg-blue-100 text-blue-800',
          'Google': 'bg-red-100 text-red-800',
          'Facebook': 'bg-indigo-100 text-indigo-800',
          'Twitter': 'bg-blue-100 text-blue-800',
          'Affiliate': 'bg-green-100 text-green-800',
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceClasses[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
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
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent User Registrations</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Last 10 new user accounts</p>
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
      id: 'U1001',
      username: 'john_doe',
      email: 'john@example.com',
      status: 'Active',
      country: 'United States',
      registrationDate: '2023-05-15 14:30',
      source: 'Direct',
    },
    {
      id: 'U1002',
      username: 'alice_smith',
      email: 'alice@example.com',
      status: 'Pending',
      country: 'Canada',
      registrationDate: '2023-05-15 15:45',
      source: 'Referral',
    },
    {
      id: 'U1003',
      username: 'bob_jones',
      email: 'bob@example.com',
      status: 'Active',
      country: 'United Kingdom',
      registrationDate: '2023-05-15 16:20',
      source: 'Google',
    },
    {
      id: 'U1004',
      username: 'emma_wilson',
      email: 'emma@example.com',
      status: 'Verifying',
      country: 'Australia',
      registrationDate: '2023-05-14 09:15',
      source: 'Facebook',
    },
    {
      id: 'U1005',
      username: 'mike_brown',
      email: 'mike@example.com',
      status: 'Active',
      country: 'Germany',
      registrationDate: '2023-05-14 11:30',
      source: 'Affiliate',
    },
    {
      id: 'U1006',
      username: 'sarah_taylor',
      email: 'sarah@example.com',
      status: 'Suspended',
      country: 'France',
      registrationDate: '2023-05-14 13:45',
      source: 'Direct',
    },
    {
      id: 'U1007',
      username: 'david_miller',
      email: 'david@example.com',
      status: 'Active',
      country: 'Spain',
      registrationDate: '2023-05-13 16:20',
      source: 'Twitter',
    },
    {
      id: 'U1008',
      username: 'lisa_davis',
      email: 'lisa@example.com',
      status: 'Pending',
      country: 'Italy',
      registrationDate: '2023-05-13 17:45',
      source: 'Referral',
    },
    {
      id: 'U1009',
      username: 'james_wilson',
      email: 'james@example.com',
      status: 'Active',
      country: 'Japan',
      registrationDate: '2023-05-12 10:30',
      source: 'Google',
    },
    {
      id: 'U1010',
      username: 'jessica_martin',
      email: 'jessica@example.com',
      status: 'Active',
      country: 'Brazil',
      registrationDate: '2023-05-12 14:15',
      source: 'Affiliate',
    },
  ];
}

export default UserRegistrationTable; 