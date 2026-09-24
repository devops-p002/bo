import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GameCard from '../components/GameCard';
import { listGames } from '../services/api/games';
import type { Game } from '../services/api/games';

const SECTION_TITLES: Record<Game['category'], string> = {
  ORIGINALS: 'Sunrion Originals',
  SLOTS: 'Slots',
  LIVE_CASINO: 'Live Casino',
  GAME_SHOWS: 'Game Shows',
  TABLE_GAMES: 'Table Games',
};

const SECTION_ORDER: Game['category'][] = ['ORIGINALS', 'SLOTS', 'LIVE_CASINO', 'GAME_SHOWS', 'TABLE_GAMES'];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listGames()
      .then(setGames)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const bySection = SECTION_ORDER.map((category) => ({
    category,
    title: SECTION_TITLES[category],
    games: games.filter((g) => g.category === category),
  })).filter((section) => section.games.length > 0);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-r from-surface-800 via-surface-700 to-surface-800 border border-surface-600 p-6 sm:p-10">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Welcome to <span className="text-accent-400">Sunrion</span>
        </h1>
        <p className="mt-2 text-surface-50/70 max-w-xl">
          Browse the catalog, manage your wallet, and get set up for real play.
        </p>
        {!isAuthenticated && (
          <div className="mt-5 flex gap-3">
            <Link to="/register" className="btn-accent">
              Create account
            </Link>
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-surface-50/50">Loading games…</p>
      ) : error ? (
        <p className="text-loss">Failed to load games: {error}</p>
      ) : (
        bySection.map((section) => (
          <section key={section.category}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">{section.title}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {section.games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
