import { useEffect, useState } from 'react';
import { listMyTransactions } from '../../services/api/wallet';
import type { WalletTransaction } from '../../services/api/wallet';
import ProfileSubpage from '../../components/ProfileSubpage';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-accent-500/15 text-accent-400',
  APPROVED: 'bg-surface-600 text-surface-50/80',
  PROCESSING: 'bg-surface-600 text-surface-50/80',
  COMPLETED: 'bg-win/15 text-win',
  FAILED: 'bg-loss/15 text-loss',
  CANCELLED: 'bg-surface-600 text-surface-50/60',
  EXPIRED: 'bg-surface-600 text-surface-50/60',
};

export default function TransactionRecords() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProfileSubpage title="Transaction records">
      <div className="card p-6">
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
    </ProfileSubpage>
  );
}
