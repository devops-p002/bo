import { appendEvent } from '@platform/audit-chain';
import type { AuditChainStore } from '@platform/audit-chain';
import { InternalError, NotFoundError } from '@platform/errors';

const AUDIT_STREAM_ID = 'backoffice-api-main';

interface AccountPlayerProfile {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface MaskedPlayerProfile {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  masked: true;
}

export interface UnmaskedPlayerProfile {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  masked: false;
}

/** `j***@example.com` - keeps enough to recognize a record was found
 * without exposing the full address. Not a general-purpose PII masking
 * library - this platform only masks email today. */
function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '***';
  return `${email[0]}***${email.slice(atIndex)}`;
}

/**
 * The backing service for Phase 7's PII-masking acceptance criterion:
 * "unmasking PII always writes an audit event with a reason before the
 * API returns the unmasked value." `unmask()` writes that audit event
 * BEFORE returning - if the audit write throws, the caller never sees
 * the real value, by construction (there is no code path that returns
 * unmasked data without the `await appendEvent(...)` above it having
 * already succeeded).
 *
 * account is the source of truth for player profile fields - this
 * service never stores or caches PII itself, only fetches it fresh on
 * every call (see PLAN.md's "services communicate only over HTTP" non-
 * negotiable) and decides, on backoffice-api's side, whether to mask.
 */
export class PlayerLookupService {
  constructor(
    private readonly accountBaseUrl: string,
    private readonly auditStore: AuditChainStore,
  ) {}

  private async fetchProfile(playerId: string): Promise<AccountPlayerProfile> {
    const response = await fetch(`${this.accountBaseUrl}/admin/players/${playerId}`);
    if (response.status === 404) throw new NotFoundError(`Unknown player ${playerId}`);
    if (!response.ok) {
      throw new InternalError(`account player lookup failed with status ${response.status}`, { meta: { status: response.status, playerId } });
    }
    return (await response.json()) as AccountPlayerProfile;
  }

  async getMasked(playerId: string): Promise<MaskedPlayerProfile> {
    const profile = await this.fetchProfile(playerId);
    return { id: profile.id, email: maskEmail(profile.email), status: profile.status, createdAt: profile.createdAt, masked: true };
  }

  async unmask(playerId: string, adminUserId: string, reason: string): Promise<UnmaskedPlayerProfile> {
    const profile = await this.fetchProfile(playerId);

    // The audit write happens BEFORE the unmasked value is returned -
    // see this class's own doc comment. A failure here (e.g. the
    // database is unreachable) propagates and the caller gets no
    // profile at all, never a partially-audited unmask.
    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'player_pii.unmasked',
      occurredAt: new Date().toISOString(),
      actor: `admin:${adminUserId}`,
      payload: { playerId, reason },
    });

    return { id: profile.id, email: profile.email, status: profile.status, createdAt: profile.createdAt, masked: false };
  }
}
