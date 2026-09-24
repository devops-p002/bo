'use strict';

/**
 * `CHECK (requested_by <> approved_by)` is the entire enforcement of
 * "nobody approves their own action" (PLAN.md §4.6) - a database
 * constraint, not an application-level check that a future code path
 * could forget. approved_by is NULL until a decision is made, at which
 * point the CHECK activates (Postgres CHECK constraints treat a NULL
 * operand as satisfying the constraint - see
 * MakerCheckerService.approve for why that's fine: it only ever sets
 * approved_by together with the decision, in one UPDATE, never leaves
 * a row where requested_by = approved_by could be written).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE maker_checker_requests (
      id           TEXT PRIMARY KEY,
      action_type  TEXT NOT NULL CHECK (action_type IN ('balance_adjustment', 'payout', 'manual_settlement', 'odds_override', 'limit_change', 'export')),
      payload      JSONB NOT NULL,
      requested_by TEXT NOT NULL REFERENCES admin_users (id),
      approved_by  TEXT REFERENCES admin_users (id),
      status       TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'execution_failed')) DEFAULT 'pending',
      execution_result JSONB,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      decided_at   TIMESTAMPTZ,
      CHECK (requested_by <> approved_by)
    );

    CREATE INDEX maker_checker_requests_status_idx ON maker_checker_requests (status);
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE maker_checker_requests;');
};
