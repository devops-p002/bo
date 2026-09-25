import { apiFetch } from '../../context/AuthContext';

export interface PlayerDevice {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  device: string;
  firstSeenAt: string;
  lastSeenAt: string;
  loginCount: number;
}

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return body;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await apiFetch('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  await parseOrThrow(response);
}

export async function listMyDevices(): Promise<PlayerDevice[]> {
  const response = await apiFetch('/auth/devices');
  return parseOrThrow(response);
}
