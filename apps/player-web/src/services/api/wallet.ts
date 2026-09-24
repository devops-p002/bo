import { apiFetch } from '../../context/AuthContext';

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFUND';
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  paymentMethod: string | null;
  externalReference: string | null;
  reason: string | null;
  createdAt: string;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function requestDeposit(amount: number, paymentMethod: string): Promise<WalletTransaction> {
  const response = await apiFetch('/wallet/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod }),
  });
  return parseOrThrow(response);
}

export async function requestWithdrawal(amount: number, paymentMethod: string): Promise<WalletTransaction> {
  const response = await apiFetch('/wallet/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod }),
  });
  return parseOrThrow(response);
}

export async function listMyTransactions(): Promise<WalletTransaction[]> {
  const response = await apiFetch('/wallet/transactions?limit=50');
  return parseOrThrow(response);
}
