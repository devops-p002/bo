import { apiFetch } from '../../context/AuthContext';

export interface Game {
  id: string;
  name: string;
  category: 'SLOTS' | 'LIVE_CASINO' | 'GAME_SHOWS' | 'TABLE_GAMES' | 'ORIGINALS';
  provider: string;
  thumbnailUrl: string | null;
}

export async function listGames(category?: string): Promise<Game[]> {
  const params = category ? `?category=${category}` : '';
  const response = await apiFetch(`/games${params}`);
  if (!response.ok) throw new Error('Failed to load games');
  return response.json();
}
