import { apiFetch } from '../../context/AuthContext';

export interface PlayerBet {
  id: string;
  gameId: string;
  gameName: string | null;
  type: string;
  status: 'PENDING' | 'SETTLED' | 'PARTIALLY_SETTLED' | 'CANCELLED' | 'VOID';
  amount: number;
  currency: string;
  odds: number | null;
  potentialWin: number;
  winAmount: number | null;
  createdAt: string;
  settledAt: string | null;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function listMyBets(): Promise<PlayerBet[]> {
  const response = await apiFetch('/bets');
  return parseOrThrow(response);
}
