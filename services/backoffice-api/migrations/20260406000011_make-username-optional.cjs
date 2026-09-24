'use strict';

/**
 * Login and identity are email-only (see admin auth, and the decision
 * that a player-facing login would be email-based too) - username stays
 * only as an optional display handle (useful later for anything public-
 * facing like a leaderboard or referral link that shouldn't show a real
 * email address), never required and never used to look anyone up.
 * The UNIQUE constraint is kept: Postgres allows any number of NULLs
 * under a UNIQUE column, so this only rejects a genuine duplicate
 * username, never coexisting NULLs.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`ALTER TABLE players ALTER COLUMN username DROP NOT NULL;`);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`ALTER TABLE players ALTER COLUMN username SET NOT NULL;`);
};
