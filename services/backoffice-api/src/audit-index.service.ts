import type { AuditRecord, ChainVerificationResult } from '@platform/audit-chain';
import { verifyChain } from '@platform/audit-chain';
import { NotFoundError } from '@platform/errors';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';

export interface AuditSource {
  name: string;
  auditUrl: string;
}

interface RemoteAuditEventsResponse {
  streamId: string;
  records: AuditRecord[];
}

/**
 * Polls every other service's GET /audit-events (see that endpoint's
 * own comment) and copies new records verbatim into this service's
 * own audit_index table, under a `source:<name>` stream id - not
 * re-hashed into a new chain, since the whole point is to keep an
 * independent copy of the SAME hashes the source service computed
 * (see the audit_index migration's comment for the full rationale:
 * this is the HTTP-polling substitute for the Redis Streams outbox
 * PLAN.md §1.5 describes).
 *
 * Idempotent by construction: the partial unique index on
 * (source_service, source_event_id) makes a re-ingested record a
 * no-op, and the watermark is only advanced past records that were
 * actually persisted.
 */
export class AuditIndexService {
  constructor(
    private readonly db: Kysely<Database>,
    private readonly sources: readonly AuditSource[],
  ) {}

  async pollOnce(): Promise<{ source: string; ingested: number }[]> {
    const results: { source: string; ingested: number }[] = [];

    for (const source of this.sources) {
      const watermark = await this.db.selectFrom('audit_index_watermarks').select('last_ingested_record_id').where('source_service', '=', source.name).executeTakeFirst();
      const after = watermark?.last_ingested_record_id;

      const url = new URL('/audit-events', source.auditUrl);
      if (after) url.searchParams.set('after', after);

      // A source being unreachable - down, not deployed yet, a DNS
      // blip - must never stop the other sources from being polled.
      // fetch() itself throws for a connection-level failure (refused,
      // reset, DNS), which is a different failure mode than a
      // non-2xx HTTP response (handled below) - both need to resume
      // from the same watermark next tick rather than abort the whole
      // poll cycle. Caught here after this crashed a real request
      // during manual smoke testing (ledger up, seven other sources
      // not running) - a unit test constructing AuditIndexService
      // directly with a mocked fetch would never have caught this,
      // since it's specifically about a real network-level throw.
      let response: Response;
      try {
        response = await fetch(url.toString());
      } catch {
        results.push({ source: source.name, ingested: 0 });
        continue;
      }
      if (!response.ok) {
        results.push({ source: source.name, ingested: 0 });
        continue;
      }
      const body = (await response.json()) as RemoteAuditEventsResponse;

      let ingested = 0;
      for (const record of body.records) {
        const result = await this.db
          .insertInto('audit_index')
          .values({
            id: record.id,
            stream_id: `source:${source.name}`,
            prev_hash: record.prevHash,
            hash: record.hash,
            event_type: record.eventType,
            occurred_at: record.occurredAt,
            actor: record.actor,
            payload: JSON.stringify(record.payload),
            source_service: source.name,
            source_event_id: record.id,
          })
          // The unique index this targets is PARTIAL (`WHERE
          // source_service IS NOT NULL` - see the audit_index
          // migration's comment: source_event_id/source_service are
          // null for this table's OTHER use, backoffice-api's own
          // maker-checker/admin-auth audit events, which aren't
          // polled from anywhere and so can't collide on this pair).
          // Postgres only lets ON CONFLICT infer a partial index as
          // its arbiter when the clause repeats that same predicate -
          // omitting it, as a plain .columns() does, made every
          // insert here fail with "no unique or exclusion constraint
          // matching the ON CONFLICT specification" instead of
          // silently no-opping on a re-poll, caught by actually
          // polling a live source with a real event rather than by
          // the (still-passing, because always-empty) happy-path
          // typecheck.
          .onConflict((oc) => oc.columns(['source_service', 'source_event_id']).where('source_service', 'is not', null).doNothing())
          .executeTakeFirst();

        if ((result.numInsertedOrUpdatedRows ?? 0n) > 0n) ingested += 1;
      }

      if (body.records.length > 0) {
        const lastId = body.records[body.records.length - 1]!.id;
        await this.db
          .insertInto('audit_index_watermarks')
          .values({ source_service: source.name, last_ingested_record_id: lastId, updated_at: new Date() })
          .onConflict((oc) => oc.column('source_service').doUpdateSet({ last_ingested_record_id: lastId, updated_at: new Date() }))
          .execute();
      }

      results.push({ source: source.name, ingested });
    }

    return results;
  }

  async getStream(streamId: string): Promise<AuditRecord[]> {
    const rows = await this.db
      .selectFrom('audit_index')
      .select(['id', 'prev_hash', 'hash', 'event_type', 'occurred_at', 'actor', 'payload'])
      .where('stream_id', '=', streamId)
      .orderBy('created_at', 'asc')
      .execute();

    if (rows.length === 0) throw new NotFoundError(`Unknown or empty audit stream ${streamId}`);

    return rows.map((row) => ({
      id: row.id,
      prevHash: row.prev_hash,
      hash: row.hash,
      eventType: row.event_type,
      occurredAt: new Date(row.occurred_at).toISOString(),
      actor: row.actor,
      payload: row.payload as Record<string, unknown>,
    }));
  }

  async verifyStream(streamId: string): Promise<ChainVerificationResult> {
    const records = await this.getStream(streamId);
    return verifyChain(records);
  }
}
