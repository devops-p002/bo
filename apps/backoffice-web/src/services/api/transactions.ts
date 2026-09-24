import { apiFetch } from '../../context/AuthContext';

export interface TransactionListFilter {
  type?: string;
  status?: string;
  paymentMethod?: string;
  currency?: string;
  playerId?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export interface TransactionListPagination {
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

export async function listTransactions(filter: TransactionListFilter, pagination: TransactionListPagination) {
  const params = new URLSearchParams();
  if (filter.type) params.set('type', filter.type);
  if (filter.status) params.set('status', filter.status);
  if (filter.paymentMethod) params.set('paymentMethod', filter.paymentMethod);
  if (filter.currency) params.set('currency', filter.currency);
  if (filter.playerId) params.set('playerId', filter.playerId);
  if (filter.search) params.set('search', filter.search);
  if (filter.minAmount !== undefined) params.set('minAmount', String(filter.minAmount));
  if (filter.maxAmount !== undefined) params.set('maxAmount', String(filter.maxAmount));
  if (filter.dateRangeStart) params.set('dateRangeStart', filter.dateRangeStart);
  if (filter.dateRangeEnd) params.set('dateRangeEnd', filter.dateRangeEnd);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.limit));

  const response = await apiFetch(`/transactions?${params.toString()}`);
  return parseOrThrow(response) as Promise<{ totalCount: number; nodes: any[] }>;
}

export async function getTransaction(id: string) {
  const response = await apiFetch(`/transactions/${id}`);
  return parseOrThrow(response);
}

export async function createTransaction(input: Record<string, unknown>) {
  const response = await apiFetch('/transactions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export async function updateTransactionStatus(id: string, input: { status: string; reason?: string }) {
  const response = await apiFetch(`/transactions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}
