import { useState, useCallback } from 'react';
import { gql, useApolloClient } from '@apollo/client';

const GET_ALL_TRANSACTIONS = gql`
  query TransactionHistory($filter: TransactionFilterInput, $pagination: PaginationInput) {
    transactions(filter: $filter, pagination: $pagination) {
      totalCount
      nodes {
        id
        type
        amount
        currency
        status
        paymentMethod
        externalReference
        createdAt
        user { username }
      }
    }
  }
`;

// Backend enums are SCREAMING_CASE (TransactionType/TransactionStatus);
// this UI was built around lowercase strings - normalize at this boundary.
const normalizeTransaction = (tx) => ({
  id: tx.id,
  transactionId: tx.id,
  type: tx.type.toLowerCase(),
  memberUsername: tx.user?.username || 'unknown',
  amount: tx.amount,
  currency: tx.currency,
  paymentMethod: tx.paymentMethod || 'unspecified',
  status: tx.status.toLowerCase(),
  createdAt: tx.createdAt,
  reference: tx.externalReference || '',
});

const useTransactions = () => {
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Mock data
  const mockTransactions = [
    {
      id: '1',
      transactionId: 'TXN001',
      type: 'deposit',
      memberUsername: 'john_doe',
      amount: 500,
      paymentMethod: 'credit_card',
      status: 'completed',
      createdAt: '2024-03-15T10:30:00Z',
      reference: 'REF001',
      currency: 'USD'
    },
    {
      id: '2',
      transactionId: 'TXN002',
      type: 'withdrawal',
      memberUsername: 'jane_smith',
      amount: 250,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      createdAt: '2024-03-15T11:45:00Z',
      reference: 'REF002',
      currency: 'USD'
    },
    {
      id: '3',
      transactionId: 'TXN003',
      type: 'bonus',
      memberUsername: 'bob_wilson',
      amount: 100,
      paymentMethod: 'system',
      status: 'completed',
      createdAt: '2024-03-15T12:00:00Z',
      reference: 'BONUS001',
      currency: 'USD'
    },
    {
      id: '4',
      transactionId: 'TXN004',
      type: 'deposit',
      memberUsername: 'alice_brown',
      amount: 1000,
      paymentMethod: 'e_wallet',
      status: 'processing',
      createdAt: '2024-03-15T13:15:00Z',
      reference: 'REF003',
      currency: 'USD'
    },
    {
      id: '5',
      transactionId: 'TXN005',
      type: 'refund',
      memberUsername: 'charlie_davis',
      amount: 75,
      paymentMethod: 'credit_card',
      status: 'completed',
      createdAt: '2024-03-15T14:30:00Z',
      reference: 'REFUND001',
      currency: 'USD'
    },
    // Add more mock data as needed
  ];

  const fetchTransactions = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const filter: any = {};
      if (filters.type && filters.type !== 'all') filter.type = filters.type.toUpperCase();
      if (filters.status && filters.status !== 'all') filter.status = filters.status.toUpperCase();
      if (filters.amountFrom) filter.minAmount = parseFloat(filters.amountFrom);
      if (filters.amountTo) filter.maxAmount = parseFloat(filters.amountTo);
      if (filters.dateFrom && filters.dateTo) {
        filter.dateRange = { start: filters.dateFrom, end: filters.dateTo };
      }

      const { data } = await apolloClient.query({
        query: GET_ALL_TRANSACTIONS,
        variables: { filter, pagination: { page: 1, limit: 50 } },
        fetchPolicy: 'network-only',
      });

      let nodes = data.transactions.nodes.map(normalizeTransaction);

      // paymentMethod and free-text search have no dedicated server-side
      // filter - apply them client-side over the fetched page.
      if (filters.method && filters.method !== 'all') {
        nodes = nodes.filter((t) => t.paymentMethod === filters.method);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        nodes = nodes.filter((t) => t.memberUsername.toLowerCase().includes(term)
          || t.transactionId.toLowerCase().includes(term)
          || t.reference.toLowerCase().includes(term));
      }

      setTransactions(nodes);
    } catch (err) {
      setError(err.graphQLErrors?.[0]?.message || err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [apolloClient]);

  const getTransactionById = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const transaction = mockTransactions.find(t => t.id === transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      return transaction;
    } catch (err) {
      setError('Failed to fetch transaction');
      console.error('Error fetching transaction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTransactionStatus = useCallback(async (transactionId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === transactionId
            ? { ...transaction, status: newStatus }
            : transaction
        )
      );
    } catch (err) {
      setError('Failed to update transaction status');
      console.error('Error updating transaction status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Exports the currently-loaded `transactions` state (i.e. whatever the
  // last fetchTransactions(filters) call returned) rather than a fixed
  // dataset - `filters` is accepted for API-shape compatibility with
  // callers but isn't re-queried here since the caller already fetched
  // with those filters before exporting.
  const exportTransactions = useCallback(async (_filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      if (transactions.length === 0) {
        throw new Error('No transactions to export');
      }

      const csvData = transactions.map(t => ({
        'Transaction ID': t.transactionId,
        'Type': t.type,
        'Member': t.memberUsername,
        'Amount': t.amount,
        'Payment Method': t.paymentMethod,
        'Status': t.status,
        'Date': new Date(t.createdAt).toLocaleDateString(),
        'Reference': t.reference
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => row[header]).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Failed to export transactions');
      console.error('Error exporting transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  const getTransactionStats = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredTransactions = [...mockTransactions];
      
      // Apply same filters as fetchTransactions
      if (filters.type && filters.type !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      if (filters.status && filters.status !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      
      const stats = {
        totalTransactions: filteredTransactions.length,
        totalAmount: filteredTransactions.reduce((sum, t) => sum + t.amount, 0),
        depositAmount: filteredTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
        withdrawalAmount: filteredTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
        bonusAmount: filteredTransactions.filter(t => t.type === 'bonus').reduce((sum, t) => sum + t.amount, 0),
        refundAmount: filteredTransactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0),
        pendingCount: filteredTransactions.filter(t => t.status === 'pending').length,
        completedCount: filteredTransactions.filter(t => t.status === 'completed').length,
        failedCount: filteredTransactions.filter(t => t.status === 'failed').length,
      };
      
      return stats;
    } catch (err) {
      setError('Failed to fetch transaction stats');
      console.error('Error fetching transaction stats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchTransactions = useCallback(async (searchTerm) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filteredTransactions = mockTransactions.filter(t => 
        t.memberUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredTransactions;
    } catch (err) {
      setError('Failed to search transactions');
      console.error('Error searching transactions:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    getTransactionById,
    updateTransactionStatus,
    exportTransactions,
    getTransactionStats,
    searchTransactions,
  };
};

export default useTransactions; 