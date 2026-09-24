'use strict';

/**
 * Real device fingerprinting, as distinct from the coarse User-Agent
 * device *classification* the previous migration added: apps/player-web
 * now collects a client-side fingerprint (canvas/WebGL/screen/timezone/
 * etc., hashed - see apps/player-web/src/lib/fingerprint.ts) and sends
 * it as a header on register/login. services/player-api upserts one row
 * per (player, fingerprint) pair here.
 *
 * The point of a separate table keyed by fingerprint (not just another
 * players column) is the reverse lookup this enables: which OTHER
 * players have logged in from this same device. That's the actual
 * fraud/multi-account signal - a single fingerprint column on players
 * can tell you "was this login familiar", but only a table indexed on
 * fingerprint can answer "who else is this".
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE player_devices (
      id            TEXT PRIMARY KEY,
      player_id     TEXT NOT NULL REFERENCES players(id),
      fingerprint   TEXT NOT NULL,
      user_agent    TEXT,
      ip_address    TEXT,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      login_count   INTEGER NOT NULL DEFAULT 1,
      UNIQUE (player_id, fingerprint)
    );

    CREATE INDEX player_devices_player_id_idx ON player_devices (player_id);
    CREATE INDEX player_devices_fingerprint_idx ON player_devices (fingerprint);

    GRANT SELECT, INSERT, UPDATE ON player_devices TO player_api_app;
    GRANT SELECT ON player_devices TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE player_devices;
  `);
};
