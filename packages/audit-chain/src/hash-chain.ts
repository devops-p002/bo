import { createHash } from 'node:crypto';

/** Genesis previous-hash for the first event in any chain - an explicit,
 * documented sentinel rather than null/empty-string, so "this is event
 * zero" is unambiguous when verifying. */
export const GENESIS_HASH = '0'.repeat(64);

export interface AuditEventInput {
  eventType: string;
  occurredAt: string;
  /** Who/what caused this event - a player id, an admin user id, or a
   * service name for system-initiated events. Never a raw session token
   * or credential (see @platform/logging's redact() for the same rule
   * applied to log lines - this is the audit-trail equivalent). */
  actor: string;
  payload: Record<string, unknown>;
}

export interface AuditRecord extends AuditEventInput {
  id: string;
  prevHash: string;
  hash: string;
}

function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Computes this event's hash as sha256(prevHash || canonicalJSON(id +
 * event fields)). Each record's hash covers the previous record's hash,
 * so altering (or deleting, or reordering) any earlier record changes
 * every hash computed after it - the tamper-evidence property PLAN.md's
 * back-office audit trail is built on.
 */
export function computeHash(id: string, prevHash: string, event: AuditEventInput): string {
  const body = canonicalize({ id, prevHash, ...event });
  return createHash('sha256').update(body).digest('hex');
}

export function buildRecord(id: string, prevHash: string, event: AuditEventInput): AuditRecord {
  return { id, prevHash, hash: computeHash(id, prevHash, event), ...event };
}

export interface ChainVerificationResult {
  valid: boolean;
  /** Index of the first record whose hash doesn't match what's
   * recomputed from its own fields plus the previous record's hash - or
   * undefined if the whole chain verifies. */
  invalidAtIndex?: number;
  reason?: string;
}

/**
 * Recomputes every record's hash from its fields and the previous
 * record's hash, comparing against the stored hash. This is the
 * detection primitive behind the "verification command that detects
 * tampering" PLAN.md's back-office phase calls for - it doesn't matter
 * whether a record was edited, deleted, reordered, or had its prevHash
 * pointer forged: any of those breaks the recomputation at or after the
 * tampered point.
 */
export function verifyChain(records: readonly AuditRecord[]): ChainVerificationResult {
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!;

    if (record.prevHash !== expectedPrevHash) {
      return { valid: false, invalidAtIndex: i, reason: 'prevHash does not match the preceding record\'s hash' };
    }

    const recomputed = computeHash(record.id, record.prevHash, {
      eventType: record.eventType,
      occurredAt: record.occurredAt,
      actor: record.actor,
      payload: record.payload,
    });

    if (recomputed !== record.hash) {
      return { valid: false, invalidAtIndex: i, reason: 'stored hash does not match the recomputed hash' };
    }

    expectedPrevHash = record.hash;
  }

  return { valid: true };
}
