'use strict';

/**
 * Backs Profile's new "Betting records" page in apps/player-web - a
 * player reading their own bet history. player_api_app had no grant on
 * `bets` at all until now (only backoffice_api_app did, via the
 * create-bets migration); this is read-only, same "never lets player-api
 * touch balance-moving state" boundary as its transactions grant (SELECT
 * only, no INSERT - nothing in player-api places bets either, per the
 * create-bets migration's own comment).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    GRANT SELECT ON bets TO player_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE SELECT ON bets FROM player_api_app;
  `);
};
