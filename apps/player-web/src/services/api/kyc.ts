import { apiFetch } from '../../context/AuthContext';

export type KycDocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycVerification {
  id: string;
  documentType: KycDocumentType;
  status: KycStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface SubmitKycInput {
  documentType: KycDocumentType;
  documentNumber: string;
  expiryDate: string;
  front: File;
  back: File;
  selfie: File;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function getMyKycStatus(): Promise<KycVerification | null> {
  const response = await apiFetch('/kyc/verification/me');
  return parseOrThrow(response);
}

export async function submitKyc(input: SubmitKycInput): Promise<KycVerification> {
  const form = new FormData();
  form.set('documentType', input.documentType);
  form.set('documentNumber', input.documentNumber);
  form.set('expiryDate', input.expiryDate);
  form.set('front', input.front);
  form.set('back', input.back);
  form.set('selfie', input.selfie);

  const response = await apiFetch('/kyc/verification', { method: 'POST', body: form });
  return parseOrThrow(response);
}
