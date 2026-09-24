import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listGames } from '../services/api/games';
import type { Game } from '../services/api/games';

export default function GameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGames()
      .then((games) => setGame(games.find((g) => g.id === gameId) ?? null))
      .finally(() => setLoading(false));
  }, [gameId]);

  if (loading) return <p className="text-surface-50/50">Loading…</p>;
  if (!game) return <p className="text-loss">Game not found.</p>;

  return (
    <div className="max-w-xl">
      <Link to="/" className="text-sm text-surface-50/50 hover:text-surface-50">
        &larr; Back to lobby
      </Link>
      <div className="card p-8 mt-3 text-center">
        <h1 className="text-2xl font-bold">{game.name}</h1>
        <p className="text-surface-50/50 text-sm mt-1">{game.provider}</p>
        {/* No real game engine exists in this repo yet - honest
            placeholder rather than a fake spin/deal button, per
            CLAUDE.md's "never fabricate a field/feature with no backend
            model" rule. */}
        <div className="mt-6 py-10 border border-dashed border-surface-600 rounded-lg text-surface-50/50">
          Gameplay isn't wired up yet - this is a catalog placeholder.
        </div>
      </div>
    </div>
  );
}
