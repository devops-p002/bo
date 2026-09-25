import { useEffect, useState } from 'react';
import { Dices, Percent } from 'lucide-react';
import { listMyBets } from '../../services/api/bets';
import type { PlayerBet } from '../../services/api/bets';
import { useAuth } from '../../context/AuthContext';
import GlassIconBadge from '../../components/GlassIconBadge';
import ProfileSubpage from '../../components/ProfileSubpage';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-accent-500/15 text-accent-400',
  SETTLED: 'bg-win/15 text-win',
  PARTIALLY_SETTLED: 'bg-win/15 text-win',
  CANCELLED: 'bg-surface-600 text-surface-50/60',
  VOID: 'bg-surface-600 text-surface-50/60',
};

export default function BettingRecords() {
  const { user } = useAuth();
  const [bets, setBets] = useState<PlayerBet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyBets()
      .then(setBets)
      .finally(() => setLoading(false));
  }, []);

  // Turnover = total amount wagered, summed client-side over this same
  // list rather than a second endpoint - see wiring-plan comment.
  const turnover = bets.reduce((sum, bet) => sum + bet.amount, 0);

  return (
    <ProfileSubpage title="Betting records">
      <div className="card p-6 flex items-center gap-3">
        <GlassIconBadge icon={Percent} tone="brand" size="md" />
        <div>
          <p className="text-sm text-surface-50/50">Turnover</p>
          <p className="text-2xl font-extrabold">
            {turnover.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {user?.currency ?? 'USD'}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <GlassIconBadge icon={Dices} tone="success" size="sm" />
          <h2 className="text-sm font-bold text-surface-50/80">Bet history</h2>
        </div>
        {loading ? (
          <p className="text-surface-50/50 text-sm">Loading…</p>
        ) : bets.length === 0 ? (
          <p className="text-surface-50/50 text-sm">
            No bets yet - real gameplay isn't wired up in BetQueen yet, so this fills in once it is.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-50/50 border-b border-surface-600">
                  <th className="py-2 pr-4 font-medium">Game</th>
                  <th className="py-2 pr-4 font-medium">Stake</th>
                  <th className="py-2 pr-4 font-medium">Win</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet.id} className="border-b border-surface-600/50">
                    <td className="py-2 pr-4">{bet.gameName ?? bet.gameId}</td>
                    <td className="py-2 pr-4">
                      {bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bet.currency}
                    </td>
                    <td className="py-2 pr-4">
                      {bet.winAmount === null ? '—' : bet.winAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[bet.status] || ''}`}>{bet.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-surface-50/50">{new Date(bet.createdAt).toLocaleString()}</td>
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
