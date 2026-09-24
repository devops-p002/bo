import { useState, useCallback } from 'react';
import { listTransactions, updateTransactionStatus } from '../../../../services/api/transactions';

// UI filter status vocabulary -> backend TransactionStatus enum (PENDING/
// APPROVED/PROCESSING/COMPLETED/FAILED/CANCELLED/EXPIRED). 'rejected' has
// no dedicated backend status - rejected rows are stored as FAILED.
const FILTER_STATUS_MAP: Record<string, string> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'FAILED',
  failed: 'FAILED',
  processing: 'PROCESSING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  expired: 'EXPIRED',
};

// Status-update action targets differ by transaction type (see
// 20260406000014_create-transactions.cjs's comment): DepositList's UI only
// offers Approve/Reject with no further step, so "approved" there means
// settling straight to COMPLETED (which is what actually credits balance -
// see TransactionsService.updateStatus). WithdrawalList's UI instead walks
// a real multi-step pipeline (Approve -> Process -> Complete) button by
// button, so "approved" there means the intermediate APPROVED state.
const DEPOSIT_ACTION_STATUS_MAP: Record<string, string> = { approved: 'COMPLETED', rejected: 'FAILED' };
const WITHDRAWAL_ACTION_STATUS_MAP: Record<string, string> = {
  approved: 'APPROVED',
  rejected: 'FAILED',
  processing: 'PROCESSING',
  completed: 'COMPLETED',
};

const reasonFor = (newStatus: string) =>
  newStatus === 'rejected' ? 'Rejected by admin' : newStatus === 'cancelled' ? 'Cancelled by admin' : undefined;

const normalizeTransaction = (tx: any) => ({
  id: tx.id,
  transactionId: tx.id,
  memberUsername: tx.username || 'unknown',
  amount: tx.amount,
  paymentMethod: tx.paymentMethod || 'unspecified',
  status: tx.status.toLowerCase(),
  createdAt: tx.createdAt,
  reference: tx.externalReference || '',
});

const buildTransactionFilter = (type: string, filters: any) => {
  const filter: any = { type };
  if (filters.status && filters.status !== 'all') {
    filter.status = FILTER_STATUS_MAP[filters.status] || filters.status.toUpperCase();
  }
  if (filters.method && filters.method !== 'all') filter.paymentMethod = filters.method;
  if (filters.searchTerm) filter.search = filters.searchTerm;
  if (filters.dateFrom && filters.dateTo) {
    filter.dateRangeStart = new Date(filters.dateFrom).toISOString();
    filter.dateRangeEnd = new Date(filters.dateTo).toISOString();
  }
  return filter;
};

const usePayments = () => {
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

  const fetchTransactions = useCallback(async (type: string, filters: any, setter: (rows: any[]) => void) => {
    setLoading(true);
    setError(null);
    try {
      const filter = buildTransactionFilter(type, filters);
      const data = await listTransactions(filter, { page: 1, limit: 50 });
      setter(data.nodes.map(normalizeTransaction));
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching ${type} transactions:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeposits = useCallback((filters = {}) => fetchTransactions('DEPOSIT', filters, setDeposits), [fetchTransactions]);
  const fetchWithdrawals = useCallback((filters = {}) => fetchTransactions('WITHDRAWAL', filters, setWithdrawals), [fetchTransactions]);

  const fetchPaymentMethods = useCallback(async () => {
    // No-op: payment methods aren't backend-managed. Kept for API-shape
    // compatibility with callers expecting a fetch function.
  }, []);

  const applyStatusUpdate = useCallback(async (id: string, status: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateTransactionStatus(id, { status, reason });
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating transaction status:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepositStatus = useCallback(
    (id: string, newStatus: string) => applyStatusUpdate(id, DEPOSIT_ACTION_STATUS_MAP[newStatus] || newStatus.toUpperCase(), reasonFor(newStatus)),
    [applyStatusUpdate],
  );
  const updateWithdrawalStatus = useCallback(
    (id: string, newStatus: string) => applyStatusUpdate(id, WITHDRAWAL_ACTION_STATUS_MAP[newStatus] || newStatus.toUpperCase(), reasonFor(newStatus)),
    [applyStatusUpdate],
  );

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
