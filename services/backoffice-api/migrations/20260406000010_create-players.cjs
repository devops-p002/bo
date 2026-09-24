'use strict';

/**
 * Real, self-contained player directory backing the Members section of
 * apps/backoffice-web - this is the consolidated-service replacement for
 * what would otherwise have been a separate services/account (see the
 * decision to keep everything inside backoffice-api rather than standing
 * up more microservices purely for an admin-only dashboard).
 *
 * balance/bonusBalance/totals are informational tracking columns, not a
 * double-entry ledger - there is no money-movement logic in this table
 * (no transactions table posts to it yet). NUMERIC(14,2) instead of an
 * integer-minor-units bigint (the convention a real money-movement
 * system would need) because nothing here actually moves money yet -
 * revisit this representation when Payments/Bets wiring adds real
 * transaction posting.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE players (
      id                      TEXT PRIMARY KEY,
      username                TEXT NOT NULL UNIQUE,
      email                   TEXT NOT NULL UNIQUE,
      first_name              TEXT,
      last_name                TEXT,
      phone                   TEXT,
      date_of_birth           DATE,
      country                 TEXT,
      currency                TEXT NOT NULL DEFAULT 'USD',
      status                  TEXT NOT NULL CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED','BANNED','PENDING')) DEFAULT 'ACTIVE',
      vip_level               TEXT NOT NULL CHECK (vip_level IN ('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND')) DEFAULT 'BRONZE',
      balance                 NUMERIC(14,2) NOT NULL DEFAULT 0,
      bonus_balance           NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_deposits          NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_withdrawals       NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_bets              NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_wins              NUMERIC(14,2) NOT NULL DEFAULT 0,
      last_login_at           TIMESTAMPTZ,
      last_login_ip           TEXT,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX players_username_idx ON players (username);
    CREATE INDEX players_email_idx ON players (email);
    CREATE INDEX players_status_idx ON players (status);
    CREATE INDEX players_created_at_idx ON players (created_at);

    GRANT SELECT, INSERT, UPDATE ON players TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON players FROM backoffice_api_app;
    DROP TABLE players;
  `);
};
