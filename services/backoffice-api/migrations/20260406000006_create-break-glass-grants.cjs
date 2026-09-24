'use strict';

/**
 * A temporary, logged elevation of an admin user's effective
 * permissions. `expires_at` is the only thing that ever matters for
 * whether a grant is currently usable - see BreakGlassService.isActive,
 * which checks `now() < expires_at` on every use rather than caching
 * an "active" boolean anywhere, so a grant becomes unusable the instant
 * its expiry passes with no separate revoke action needed (same
 * lazy-expiry shape as services/bonus's bonuses and
 * services/responsible-gambling's self-exclusions).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE break_glass_grants (
      id          TEXT PRIMARY KEY,
      granted_to  TEXT NOT NULL REFERENCES admin_users (id),
      reason      TEXT NOT NULL,
      role_name   TEXT NOT NULL,
      reviewed_by TEXT NOT NULL REFERENCES admin_users (id),
      granted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at  TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX break_glass_grants_granted_to_expires_at_idx ON break_glass_grants (granted_to, expires_at);
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE break_glass_grants;');
};
