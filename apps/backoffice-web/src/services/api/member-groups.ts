import { apiFetch } from '../../context/AuthContext';

async function parseOrThrow(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || `Request failed (${response.status})`);
  }
  return body;
}

export interface MemberGroup {
  id: string;
  name: string;
  category: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  memberCount: number;
  createdAt: string;
}

export interface MemberGroupMember {
  id: string;
  username: string | null;
  email: string;
  addedAt: string;
}

export async function listMemberGroups(): Promise<MemberGroup[]> {
  const response = await apiFetch('/member-groups');
  return parseOrThrow(response);
}

export async function createMemberGroup(input: { name: string; category?: string; status?: string }) {
  const response = await apiFetch('/member-groups', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export async function updateMemberGroup(id: string, input: { name?: string; category?: string; status?: string }) {
  const response = await apiFetch(`/member-groups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return parseOrThrow(response);
}

export async function deleteMemberGroup(id: string) {
  const response = await apiFetch(`/member-groups/${id}`, { method: 'DELETE' });
  return parseOrThrow(response);
}

export async function listGroupMembers(groupId: string): Promise<MemberGroupMember[]> {
  const response = await apiFetch(`/member-groups/${groupId}/members`);
  return parseOrThrow(response);
}

export async function addGroupMember(groupId: string, playerId: string) {
  const response = await apiFetch(`/member-groups/${groupId}/members`, {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
  return parseOrThrow(response);
}

export async function removeGroupMember(groupId: string, playerId: string) {
  const response = await apiFetch(`/member-groups/${groupId}/members/${playerId}`, { method: 'DELETE' });
  return parseOrThrow(response);
}
