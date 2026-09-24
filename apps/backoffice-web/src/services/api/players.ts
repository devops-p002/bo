import { apiFetch } from '../../context/AuthContext';

export interface PlayerListFilter {
  search?: string;
  status?: string;
  vipLevel?: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface PlayerListPagination {
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

export async function listPlayers(filter: PlayerListFilter, pagination: PlayerListPagination) {
  const params = new URLSearchParams();
  if (filter.search) params.set('search', filter.search);
  if (filter.status) params.set('status', filter.status);
  if (filter.vipLevel) params.set('vipLevel', filter.vipLevel);
  if (filter.dateRangeStart) params.set('dateRangeStart', filter.dateRangeStart);
  if (filter.dateRangeEnd) params.set('dateRangeEnd', filter.dateRangeEnd);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.limit));

  const response = await apiFetch(`/players?${params.toString()}`);
  return parseOrThrow(response) as Promise<{ totalCount: number; nodes: any[] }>;
}

export async function getPlayer(id: string) {
  const response = await apiFetch(`/players/${id}`);
  return parseOrThrow(response);
}

export async function updatePlayer(id: string, input: Record<string, unknown>) {
  const response = await apiFetch(`/players/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export async function createPlayer(input: Record<string, unknown>) {
  const response = await apiFetch('/players', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}
