'use strict';

/**
 * Adds real player authentication on top of the existing players table
 * (previously admin-created only, no password). password_hash is
 * nullable because pre-existing admin-created rows have none - such a
 * player simply can't log into apps/player-web until an admin sets one
 * or they register fresh with the same email (services/player-api's own
 * registration flow rejects a duplicate email either way).
 *
 * player_sessions mirrors admin_sessions - a real, revocable server-side
 * session row, not a bare stateless JWT nobody can invalidate before its
 * own TTL.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE players ADD COLUMN password_hash TEXT;

    CREATE TABLE player_sessions (
      id          TEXT PRIMARY KEY,
      player_id   TEXT NOT NULL REFERENCES players(id),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at  TIMESTAMPTZ NOT NULL,
      revoked_at  TIMESTAMPTZ
    );

    CREATE INDEX player_sessions_player_id_idx ON player_sessions (player_id);
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE player_sessions;
    ALTER TABLE players DROP COLUMN password_hash;
  `);
};
