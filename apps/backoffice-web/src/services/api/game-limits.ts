import { apiFetch } from '../../context/AuthContext';

// Only covers what the Bets section's "Bet Limits" tab needs (list +
// per-game min/max bet and max win). Unrelated to the dead, never-imported
// services/api/games.ts (same class of leftover as services/api/payments.ts)
// - full CMS games CRUD is a separate, not-yet-built phase.

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function listGamesWithLimits(category?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const response = await apiFetch(`/games?${params.toString()}`);
  return parseOrThrow(response) as Promise<any[]>;
}

export async function updateGameLimits(id: string, input: { minBet?: number; maxBet?: number; maxWin?: number }) {
  const response = await apiFetch(`/games/${id}/limits`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}
