import React, { useMemo } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Card } from '../../common/UI';

const GET_DEPOSITS = gql`
  query PaymentDepositList {
    transactions(filter: { type: DEPOSIT }, pagination: { limit: 50 }) {
      totalCount
      nodes {
        id
        amount
        currency
        status
        paymentMethod
        createdAt
        user { username }
      }
    }
  }
`;

const APPROVE_TRANSACTION = gql`
  mutation ApproveDepositRow($id: ID!) {
    approveTransaction(id: $id) { id status }
  }
`;

const REJECT_TRANSACTION = gql`
  mutation RejectDepositRow($id: ID!) {
    rejectTransaction(id: $id, reason: "Rejected by admin") { id status }
  }
`;

const STATUS_LABELS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

const PaymentDeposit = () => {
  const { data, loading, error, refetch } = useQuery(GET_DEPOSITS, { fetchPolicy: 'cache-and-network' });
  const [approveTransaction] = useMutation(APPROVE_TRANSACTION);
  const [rejectTransaction] = useMutation(REJECT_TRANSACTION);

  const deposits = data?.transactions?.nodes ?? [];

  const stats = useMemo(() => {
    const completed = deposits.filter((d) => d.status === 'COMPLETED');
    const pending = deposits.filter((d) => d.status === 'PENDING' || d.status === 'PROCESSING');
    const failed = deposits.filter((d) => d.status === 'FAILED' || d.status === 'CANCELLED' || d.status === 'EXPIRED');
    const totalAmount = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    return { completed: completed.length, pending: pending.length, failed: failed.length, totalAmount };
  }, [deposits]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (id) => {
    await approveTransaction({ variables: { id } });
    refetch();
  };

  const handleReject = async (id) => {
    await rejectTransaction({ variables: { id } });
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Deposit Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor and manage member deposit transactions
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Failed</div>
            <div className="text-2xl font-bold text-gray-900">{stats.failed}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm font-medium text-gray-500">Total Amount</div>
            <div className="text-2xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Deposit Transactions</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-sm p-4 text-gray-500">Loading…</td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="text-center text-sm p-4 text-red-600">Failed to load: {error.message}</td></tr>
                ) : deposits.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-sm p-4 text-gray-500">No deposits found.</td></tr>
                ) : deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {deposit.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deposit.user?.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deposit.currency} {deposit.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deposit.paymentMethod || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deposit.status)}`}>
                        {STATUS_LABELS[deposit.status] || deposit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(deposit.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {deposit.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApprove(deposit.id)} className="text-green-600 hover:text-green-900">Approve</button>
                          <button onClick={() => handleReject(deposit.id)} className="text-red-600 hover:text-red-900">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentDeposit;
