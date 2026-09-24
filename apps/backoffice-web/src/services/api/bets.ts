import { apiFetch } from '../../context/AuthContext';

export interface BetListFilter {
  status?: string;
  gameCategory?: string;
  playerId?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface BetListPagination {
  page: number;
  limit: number;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function listBets(filter: BetListFilter, pagination: BetListPagination) {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.gameCategory) params.set('gameCategory', filter.gameCategory);
  if (filter.playerId) params.set('playerId', filter.playerId);
  if (filter.search) params.set('search', filter.search);
  if (filter.minAmount !== undefined) params.set('minAmount', String(filter.minAmount));
  if (filter.maxAmount !== undefined) params.set('maxAmount', String(filter.maxAmount));
  if (filter.dateRangeStart) params.set('dateRangeStart', filter.dateRangeStart);
  if (filter.dateRangeEnd) params.set('dateRangeEnd', filter.dateRangeEnd);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.limit));

  const response = await apiFetch(`/bets?${params.toString()}`);
  return parseOrThrow(response) as Promise<{ totalCount: number; nodes: any[] }>;
}

export async function getBet(id: string) {
  const response = await apiFetch(`/bets/${id}`);
  return parseOrThrow(response);
}

export async function updateBetStatus(id: string, input: { status: string; winAmount?: number; result?: unknown; voidReason?: string }) {
  const response = await apiFetch(`/bets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}
