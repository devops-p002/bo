import { Link } from 'react-router-dom';
import type { Game } from '../services/api/games';

const CATEGORY_GRADIENT: Record<Game['category'], string> = {
  SLOTS: 'from-purple-700 to-fuchsia-900',
  LIVE_CASINO: 'from-red-700 to-rose-900',
  GAME_SHOWS: 'from-amber-600 to-orange-900',
  TABLE_GAMES: 'from-emerald-700 to-teal-900',
  ORIGINALS: 'from-accent-600 to-yellow-900',
};

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="group block rounded-lg overflow-hidden border border-surface-600 bg-surface-800 hover:border-accent-500 transition-colors"
    >
      <div className={`aspect-[3/4] flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENT[game.category]} p-3 text-center`}>
        <span className="font-bold text-white text-sm sm:text-base drop-shadow group-hover:scale-105 transition-transform">
          {game.name}
        </span>
      </div>
      <div className="p-2">
        <p className="text-sm font-medium truncate">{game.name}</p>
        <p className="text-xs text-surface-50/50">{game.provider}</p>
      </div>
    </Link>
  );
}
