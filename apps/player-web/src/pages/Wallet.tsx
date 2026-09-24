import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { listMyTransactions, requestDeposit, requestWithdrawal } from '../services/api/wallet';
import type { WalletTransaction } from '../services/api/wallet';

const PAYMENT_METHODS = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'e_wallet', label: 'E-Wallet' },
  { value: 'cryptocurrency', label: 'Cryptocurrency' },
];

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-400',
  APPROVED: 'bg-blue-500/15 text-blue-400',
  PROCESSING: 'bg-blue-500/15 text-blue-400',
  COMPLETED: 'bg-win/15 text-win',
  FAILED: 'bg-loss/15 text-loss',
  CANCELLED: 'bg-surface-600 text-surface-50/60',
  EXPIRED: 'bg-surface-600 text-surface-50/60',
};

function Tab({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active ? 'bg-surface-600 text-accent-400' : 'text-surface-50/60 hover:text-surface-50'
      }`}
    >
      {children}
    </button>
  );
}

function RequestForm({ kind, onSubmitted }: { kind: 'deposit' | 'withdraw'; onSubmitted: () => void }) {
  const { user, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYMENT_METHODS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const numericAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      if (kind === 'deposit') {
        await requestDeposit(numericAmount, method);
      } else {
        await requestWithdrawal(numericAmount, method);
      }
      setSuccess('Request submitted - pending admin approval.');
      setAmount('');
      await refreshWallet();
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      <div>
        <label className="form-label">Amount ({user?.currency ?? 'USD'})</label>
        <input type="number" min="0.01" step="0.01" required className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div>
        <label className="form-label">Payment method</label>
        <select className="form-input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-loss text-sm">{error}</p>}
      {success && <p className="text-win text-sm">{success}</p>}
      <button type="submit" disabled={submitting} className="btn-accent w-full capitalize">
        {submitting ? 'Submitting…' : kind}
      </button>
    </form>
  );
}

export default function Wallet() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = () => {
    setLoading(true);
    listMyTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-6">
        <p className="text-sm text-surface-50/50">Balance</p>
        <p className="text-3xl font-extrabold">
          {user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {user?.currency}
        </p>
      </div>

      <div className="card p-6">
        <div className="flex gap-1 mb-5 bg-surface-700 p-1 rounded-lg w-fit">
          <Tab active={tab === 'deposit'} onClick={() => setTab('deposit')}>
            Deposit
          </Tab>
          <Tab active={tab === 'withdraw'} onClick={() => setTab('withdraw')}>
            Withdraw
          </Tab>
        </div>
        <RequestForm kind={tab} onSubmitted={loadTransactions} />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Transaction history</h2>
        {loading ? (
          <p className="text-surface-50/50 text-sm">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="text-surface-50/50 text-sm">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-50/50 border-b border-surface-600">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Method</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-600/50">
                    <td className="py-2 pr-4 capitalize">{tx.type.toLowerCase()}</td>
                    <td className="py-2 pr-4">
                      {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
                    </td>
                    <td className="py-2 pr-4 text-surface-50/70">{tx.paymentMethod || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[tx.status] || ''}`}>{tx.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-surface-50/50">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
