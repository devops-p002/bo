import React from 'react';
import { Card, Table } from '../../../common/UI';
import { useReports } from '../hooks/useReports';

const PaymentReport = ({ filters }) => {
  const { data, loading, error } = useReports('payment', filters);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const columns = [
    { header: 'Date', accessor: 'date' },
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'Type', accessor: 'type' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Method', accessor: 'method' },
    { header: 'Status', accessor: 'status' },
    { header: 'User', accessor: 'user' },
  ];

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Payment Report</h2>
      <Table columns={columns} data={data} />
    </Card>
  );
};

export default PaymentReport; 