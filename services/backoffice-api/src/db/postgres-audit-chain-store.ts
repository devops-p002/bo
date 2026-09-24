import type { AuditChainStore, AuditRecord } from '@platform/audit-chain';
import type { Kysely } from 'kysely';
import type { Database } from './schema.js';

/**
 * Postgres-backed AuditChainStore over `audit_index` - the same
 * interface every other service's PostgresAuditChainStore implements,
 * pointed at the one table that also holds the polled cross-service
 * aggregate (see the audit_index migration's comment). Backoffice's own
 * actions (maker-checker decisions, break-glass grants) are appended
 * here under `backoffice-api-main`; AuditIndexService appends polled
 * foreign events under their own `source:<service>` stream ids,
 * setting sourceService/sourceEventId, which this store passes through
 * as-is when present.
 */
export class PostgresAuditChainStore implements AuditChainStore {
  constructor(private readonly db: Kysely<Database>) {}

  async getLatest(streamId: string): Promise<AuditRecord | null> {
    const row = await this.db
      .selectFrom('audit_index')
      .select(['id', 'prev_hash', 'hash', 'event_type', 'occurred_at', 'actor', 'payload'])
      .where('stream_id', '=', streamId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .executeTakeFirst();

    if (!row) return null;
    return toAuditRecord(row);
  }

  async append(streamId: string, record: AuditRecord, source?: { service: string; eventId: string }): Promise<void> {
    await this.db
      .insertInto('audit_index')
      .values({
        id: record.id,
        stream_id: streamId,
        prev_hash: record.prevHash,
        hash: record.hash,
        event_type: record.eventType,
        occurred_at: record.occurredAt,
        actor: record.actor,
        payload: JSON.stringify(record.payload),
        source_service: source?.service ?? null,
        source_event_id: source?.eventId ?? null,
      })
      .execute();
  }

  async getAll(streamId: string): Promise<AuditRecord[]> {
    const rows = await this.db
      .selectFrom('audit_index')
      .select(['id', 'prev_hash', 'hash', 'event_type', 'occurred_at', 'actor', 'payload'])
      .where('stream_id', '=', streamId)
      .orderBy('created_at', 'asc')
      .execute();

    return rows.map(toAuditRecord);
  }
}

function toAuditRecord(row: {
  id: string;
  prev_hash: string;
  hash: string;
  event_type: string;
  occurred_at: Date;
  actor: string;
  payload: unknown;
}): AuditRecord {
  return {
    id: row.id,
    prevHash: row.prev_hash,
    hash: row.hash,
    eventType: row.event_type,
    occurredAt: new Date(row.occurred_at).toISOString(),
    actor: row.actor,
    payload: row.payload as Record<string, unknown>,
  };
}
