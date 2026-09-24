'use strict';

/**
 * Backs real, revocable server-side sessions for the admin-web login flow
 * (as opposed to a bare stateless JWT nobody can invalidate before it
 * naturally expires). The access token issued at login still carries a
 * `sid` claim; JwtAuthGuard checks this table on every request so a
 * revoked/expired row invalidates an otherwise-still-valid JWT signature
 * immediately, not just at its natural TTL.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE admin_sessions (
      id            TEXT PRIMARY KEY,
      admin_user_id TEXT NOT NULL REFERENCES admin_users(id),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at    TIMESTAMPTZ NOT NULL,
      revoked_at    TIMESTAMPTZ
    );

    CREATE INDEX admin_sessions_admin_user_id_idx ON admin_sessions (admin_user_id);

    GRANT SELECT, INSERT, UPDATE ON admin_sessions TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON admin_sessions FROM backoffice_api_app;
    DROP TABLE admin_sessions;
  `);
};
