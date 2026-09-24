import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GameCard from '../components/GameCard';
import { listGames } from '../services/api/games';
import type { Game } from '../services/api/games';

const TITLES: Record<string, string> = {
  SLOTS: 'Slots',
  LIVE_CASINO: 'Live Casino',
  GAME_SHOWS: 'Game Shows',
  TABLE_GAMES: 'Table Games',
  ORIGINALS: 'BetQueen Originals',
};

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    listGames(category)
      .then(setGames)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{(category && TITLES[category]) || category}</h1>
      {loading ? (
        <p className="text-surface-50/50">Loading games…</p>
      ) : error ? (
        <p className="text-loss">Failed to load games: {error}</p>
      ) : games.length === 0 ? (
        <p className="text-surface-50/50">No games in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
