'use strict';

/**
 * Backs the Payments section of apps/backoffice-web (Deposit Management,
 * Withdrawal Management, Transaction History). Payment Methods stays
 * mock per CLAUDE.md - no backend model requested for it yet.
 *
 * status carries an APPROVED/PROCESSING pair distinct from COMPLETED so
 * the withdrawal review pipeline (pending -> approved -> processing ->
 * completed) the UI already renders has real states to move through;
 * deposits typically skip straight from PENDING to COMPLETED via the
 * same approve action, matching how they already behaved before this
 * table existed.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE transactions (
      id                   TEXT PRIMARY KEY,
      player_id            TEXT NOT NULL REFERENCES players(id),
      type                 TEXT NOT NULL CHECK (type IN ('DEPOSIT','WITHDRAWAL','BONUS','REFUND')),
      amount               NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      currency             TEXT NOT NULL DEFAULT 'USD',
      status               TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','PROCESSING','COMPLETED','FAILED','CANCELLED','EXPIRED')) DEFAULT 'PENDING',
      payment_method       TEXT,
      external_reference   TEXT,
      reason               TEXT,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX transactions_player_id_idx ON transactions (player_id);
    CREATE INDEX transactions_type_idx ON transactions (type);
    CREATE INDEX transactions_status_idx ON transactions (status);
    CREATE INDEX transactions_created_at_idx ON transactions (created_at);

    GRANT SELECT, INSERT, UPDATE ON transactions TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON transactions FROM backoffice_api_app;
    DROP TABLE transactions;
  `);
};
