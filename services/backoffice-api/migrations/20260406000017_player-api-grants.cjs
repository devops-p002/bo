'use strict';

/**
 * Creates the player_api_app role and grants its table-level privileges.
 *
 * Unlike backoffice_api_app (created by infra/postgres/init-databases.sh,
 * which only runs once against a *fresh* Postgres volume), this role is
 * created here instead - migrations run as the bo_admin superuser on
 * every deploy (see .github/workflows/deploy.yml's migration step), so
 * this is what actually takes effect against the VM's already-existing
 * production volume, not just a brand-new one. The `IF NOT EXISTS` guard
 * makes it safe to run again on an environment where the role already
 * exists (local dev, where it may have been created by hand first).
 *
 * No UPDATE on transactions: a player can create a PENDING deposit or
 * withdrawal request and read their own history, but approving/rejecting
 * one - the only thing that ever moves balance - stays exclusively an
 * admin action through backoffice-api's TransactionsService. UPDATE on
 * players covers login/register writing password_hash and a player
 * editing their own profile fields; it does NOT make balance writable
 * from player-api application code - services/player-api simply never
 * issues an UPDATE to that column.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  const password = process.env.SERVICE_DB_PASSWORD_PLAYER_API || 'dev_only_player_api_password';

  pgm.sql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'player_api_app') THEN
        CREATE ROLE player_api_app WITH LOGIN PASSWORD '${password}';
      ELSE
        ALTER ROLE player_api_app WITH LOGIN PASSWORD '${password}';
      END IF;
    END
    $$;

    GRANT CONNECT ON DATABASE backoffice_api TO player_api_app;
    GRANT USAGE ON SCHEMA public TO player_api_app;

    GRANT SELECT, INSERT, UPDATE ON players TO player_api_app;
    GRANT SELECT, INSERT ON transactions TO player_api_app;
    GRANT SELECT, INSERT, UPDATE ON player_sessions TO player_api_app;
    GRANT SELECT ON games TO player_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON players FROM player_api_app;
    REVOKE ALL ON transactions FROM player_api_app;
    REVOKE ALL ON player_sessions FROM player_api_app;
    REVOKE ALL ON games FROM player_api_app;
    REVOKE USAGE ON SCHEMA public FROM player_api_app;
    REVOKE CONNECT ON DATABASE backoffice_api FROM player_api_app;
  `);
};
