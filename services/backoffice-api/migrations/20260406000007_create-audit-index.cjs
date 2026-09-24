'use strict';

/**
 * The cross-service audit aggregate (PLAN.md §1.4). Same shape and
 * same @platform/audit-chain-backed hash-chaining as every other
 * service's local audit_events table - the difference is which
 * stream_ids live here: `backoffice-api-main` for this service's own
 * actions (maker-checker decisions, break-glass grants), and one
 * `source:<serviceName>` stream per polled service
 * (`source:ledger`, `source:account`, ...), each an independent chain
 * fed by AuditIndexService polling that service's own GET
 * /audit-events endpoint (see platform/CLAUDE.md for why this is an
 * HTTP-polling substitute for the Redis Streams outbox PLAN.md
 * describes, not a cross-service table read - nothing here ever
 * queries another service's database).
 *
 * `source_event_id`/`source_service` let a foreign event be traced
 * back to the original service's own record without ever needing to
 * query that service again, and make re-polling idempotent (see
 * audit_index_watermarks below for the actual resume mechanism, which
 * this column is a defense-in-depth check against, not the primary
 * one).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE audit_index (
      id              TEXT PRIMARY KEY,
      stream_id       TEXT NOT NULL,
      prev_hash       TEXT NOT NULL,
      hash            TEXT NOT NULL,
      event_type      TEXT NOT NULL,
      occurred_at     TIMESTAMPTZ NOT NULL,
      actor           TEXT NOT NULL,
      payload         JSONB NOT NULL,
      source_service  TEXT,
      source_event_id TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX audit_index_stream_id_created_at_idx ON audit_index (stream_id, created_at);
    CREATE UNIQUE INDEX audit_index_source_service_event_id_idx ON audit_index (source_service, source_event_id) WHERE source_service IS NOT NULL;

    CREATE TABLE audit_index_watermarks (
      source_service        TEXT PRIMARY KEY,
      last_ingested_record_id TEXT,
      updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE audit_index_watermarks;
    DROP TABLE audit_index;
  `);
};
