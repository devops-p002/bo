import { apiFetch } from '../../context/AuthContext';

export interface KycListFilter {
  status?: string;
  playerId?: string;
  search?: string;
}

export interface KycListPagination {
  page: number;
  limit: number;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function listKyc(filter: KycListFilter, pagination: KycListPagination) {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.playerId) params.set('playerId', filter.playerId);
  if (filter.search) params.set('search', filter.search);
  params.set('page', String(pagination.page));
  params.set('limit', String(pagination.limit));

  const response = await apiFetch(`/kyc?${params.toString()}`);
  return parseOrThrow(response) as Promise<{ totalCount: number; nodes: any[] }>;
}

export async function getKyc(id: string) {
  const response = await apiFetch(`/kyc/${id}`);
  return parseOrThrow(response);
}

export async function updateKycStatus(id: string, input: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) {
  const response = await apiFetch(`/kyc/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export function kycImageUrl(id: string, which: 'front' | 'back' | 'selfie'): string {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  return `${base}/kyc/${id}/image/${which}`;
}
