import { useState, useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';

const TRANSACTION_FIELDS = `
  id
  amount
  currency
  status
  paymentMethod
  externalReference
  createdAt
  user { username }
`;

const GET_TRANSACTIONS = gql`
  query PaymentTransactions($filter: TransactionFilterInput, $pagination: PaginationInput) {
    transactions(filter: $filter, pagination: $pagination) {
      totalCount
      nodes {
        ${TRANSACTION_FIELDS}
      }
    }
  }
`;

const APPROVE_TRANSACTION = gql`
  mutation ApproveDeposit($id: ID!) {
    approveTransaction(id: $id) { ${TRANSACTION_FIELDS} }
  }
`;

const REJECT_TRANSACTION = gql`
  mutation RejectDeposit($id: ID!, $reason: String!) {
    rejectTransaction(id: $id, reason: $reason) { ${TRANSACTION_FIELDS} }
  }
`;

const CANCEL_TRANSACTION = gql`
  mutation CancelDeposit($id: ID!, $reason: String) {
    cancelTransaction(id: $id, reason: $reason) { ${TRANSACTION_FIELDS} }
  }
`;

// Backend TransactionStatus enum is PENDING/PROCESSING/COMPLETED/FAILED/
// CANCELLED/EXPIRED (SCREAMING_CASE, from GraphQL). The existing UI
// (DepositList/WithdrawalList) was built around lowercase status strings
// like 'approved'/'rejected' - normalize at this boundary so those
// components don't need to change.
const normalizeTransaction = (tx) => ({
  id: tx.id,
  transactionId: tx.id,
  memberUsername: tx.user?.username || 'unknown',
  amount: tx.amount,
  paymentMethod: tx.paymentMethod || 'unspecified',
  status: tx.status.toLowerCase(),
  createdAt: tx.createdAt,
  reference: tx.externalReference || '',
});

const buildTransactionFilter = (type: any, filters: any) => {
  const filter: any = { type };
  if (filters.status && filters.status !== 'all') {
    // UI status vocabulary -> backend TransactionStatus enum
    const statusMap = {
      approved: 'COMPLETED',
      completed: 'COMPLETED',
      rejected: 'FAILED',
      failed: 'FAILED',
      pending: 'PENDING',
      processing: 'PROCESSING',
      cancelled: 'CANCELLED',
      expired: 'EXPIRED',
    };
    filter.status = statusMap[filters.status] || filters.status.toUpperCase();
  }
  if (filters.dateFrom && filters.dateTo) {
    filter.dateRange = { start: filters.dateFrom, end: filters.dateTo };
  }
  return filter;
};

const usePayments = () => {
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  // Payment methods have no backend model/schema yet - kept as local-only
  // state (not persisted) rather than a real integration.
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      name: 'Visa/Mastercard',
      type: 'credit_card',
      status: 'active',
      minAmount: 10,
      maxAmount: 5000,
      processingTime: 'Instant',
      fees: '2.5%',
      description: 'Credit and debit cards accepted (not backend-managed yet)',
    },
    {
      id: '2',
      name: 'Bank Transfer',
      type: 'bank_transfer',
      status: 'active',
      minAmount: 50,
      maxAmount: 10000,
      processingTime: '1-3 business days',
      fees: '$5',
      description: 'Direct bank transfer (not backend-managed yet)',
    },
  ]);

  const fetchTransactions = useCallback(async (type, filters, setter) => {
    setLoading(true);
    setError(null);
    try {
      const searchFilters = { ...filters };
      const filter = buildTransactionFilter(type, searchFilters);
      const { data } = await apolloClient.query({
        query: GET_TRANSACTIONS,
        variables: { filter, pagination: { page: 1, limit: 50 } },
        fetchPolicy: 'network-only',
      });
      let nodes = data.transactions.nodes.map(normalizeTransaction);
      if (searchFilters.searchTerm) {
        const term = searchFilters.searchTerm.toLowerCase();
        nodes = nodes.filter((t) => t.memberUsername.toLowerCase().includes(term)
          || t.transactionId.toLowerCase().includes(term));
      }
      setter(nodes);
    } catch (err) {
      setError(err.graphQLErrors?.[0]?.message || err.message);
      console.error(`Error fetching ${type} transactions:`, err);
    } finally {
      setLoading(false);
    }
  }, [apolloClient]);

  const fetchDeposits = useCallback((filters = {}) => fetchTransactions('DEPOSIT', filters, setDeposits), [fetchTransactions]);
  const fetchWithdrawals = useCallback((filters = {}) => fetchTransactions('WITHDRAWAL', filters, setWithdrawals), [fetchTransactions]);

  const fetchPaymentMethods = useCallback(async () => {
    // No-op: payment methods aren't backend-managed. Kept for API-shape
    // compatibility with callers expecting a fetch function.
  }, []);

  const applyStatusUpdate = useCallback(async (id, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      if (newStatus === 'approved' || newStatus === 'completed') {
        await apolloClient.mutate({ mutation: APPROVE_TRANSACTION, variables: { id } });
      } else if (newStatus === 'rejected' || newStatus === 'failed') {
        await apolloClient.mutate({ mutation: REJECT_TRANSACTION, variables: { id, reason: 'Rejected by admin' } });
      } else if (newStatus === 'cancelled') {
        await apolloClient.mutate({ mutation: CANCEL_TRANSACTION, variables: { id, reason: 'Cancelled by admin' } });
      } else {
        throw new Error(`Unsupported status transition: ${newStatus}`);
      }
    } catch (err) {
      setError(err.graphQLErrors?.[0]?.message || err.message);
      console.error('Error updating transaction status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apolloClient]);

  const updateDepositStatus = useCallback((id, newStatus) => applyStatusUpdate(id, newStatus), [applyStatusUpdate]);
  const updateWithdrawalStatus = useCallback((id, newStatus) => applyStatusUpdate(id, newStatus), [applyStatusUpdate]);

  const createPaymentMethod = useCallback(async (methodData) => {
    setPaymentMethods((prev) => [...prev, { id: Date.now().toString(), ...methodData }]);
  }, []);

  const updatePaymentMethod = useCallback(async (methodId, methodData) => {
    setPaymentMethods((prev) => prev.map((m) => (m.id === methodId ? { ...m, ...methodData } : m)));
  }, []);

  const deletePaymentMethod = useCallback(async (methodId) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== methodId));
  }, []);

  return {
    deposits,
    withdrawals,
    paymentMethods,
    loading,
    error,
    fetchDeposits,
    fetchWithdrawals,
    fetchPaymentMethods,
    updateDepositStatus,
    updateWithdrawalStatus,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  };
};

export default usePayments;
