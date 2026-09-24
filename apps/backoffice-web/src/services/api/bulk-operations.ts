import { apiFetch } from '../../context/AuthContext';

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

export interface BulkOperation {
  id: string;
  operationType: 'STATUS_CHANGE' | 'VIP_LEVEL_UPDATE' | 'BALANCE_ADJUSTMENT';
  value: string;
  affectedCount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  errorMessage: string | null;
  createdBy: string;
  createdAt: string;
  completedAt: string | null;
}

export async function listBulkOperations(): Promise<BulkOperation[]> {
  const response = await apiFetch('/bulk-operations');
  return parseOrThrow(response);
}

export async function createBulkOperation(input: { operationType: string; playerIds: string[]; value: string }) {
  const response = await apiFetch('/bulk-operations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}
