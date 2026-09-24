import { useState, useCallback } from 'react';
import { listTransactions } from '../../../../services/api/transactions';

// Backend enums are SCREAMING_CASE (TransactionType/TransactionStatus);
// this UI was built around lowercase strings - normalize at this boundary.
const normalizeTransaction = (tx: any) => ({
  id: tx.id,
  transactionId: tx.id,
  type: tx.type.toLowerCase(),
  memberUsername: tx.username || 'unknown',
  amount: tx.amount,
  currency: tx.currency,
  paymentMethod: tx.paymentMethod || 'unspecified',
  status: tx.status.toLowerCase(),
  createdAt: tx.createdAt,
  reference: tx.externalReference || '',
});

const useTransactions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const filter: any = {};
      if (filters.type && filters.type !== 'all') filter.type = filters.type.toUpperCase();
      if (filters.status && filters.status !== 'all') filter.status = filters.status.toUpperCase();
      if (filters.method && filters.method !== 'all') filter.paymentMethod = filters.method;
      if (filters.searchTerm) filter.search = filters.searchTerm;
      if (filters.amountFrom) filter.minAmount = parseFloat(filters.amountFrom);
      if (filters.amountTo) filter.maxAmount = parseFloat(filters.amountTo);
      if (filters.dateFrom && filters.dateTo) {
        filter.dateRangeStart = new Date(filters.dateFrom).toISOString();
        filter.dateRangeEnd = new Date(filters.dateTo).toISOString();
      }

      const data = await listTransactions(filter, { page: 1, limit: 50 });
      setTransactions(data.nodes.map(normalizeTransaction));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Exports the currently-loaded `transactions` state (i.e. whatever the
  // last fetchTransactions(filters) call returned) rather than re-querying.
  const exportTransactions = useCallback(async (_filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      if (transactions.length === 0) {
        throw new Error('No transactions to export');
      }

      const csvData = transactions.map((t: any) => ({
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
    } catch (err: any) {
      setError(err.message || 'Failed to export transactions');
      console.error('Error exporting transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    exportTransactions,
  };
};

export default useTransactions;
