'use strict';

/**
 * Backs the Bets section's "Bet Limits" tab - per-game min/max bet and max
 * win, edited through GET/PATCH /games (see games.service.ts). Column-level
 * GRANT UPDATE restricts backoffice_api_app to exactly these three columns
 * even at the database level, matching this repo's least-privilege
 * convention elsewhere (e.g. player_api_app having no UPDATE grant on
 * transactions at all).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE games
      ADD COLUMN min_bet NUMERIC(14,2),
      ADD COLUMN max_bet NUMERIC(14,2),
      ADD COLUMN max_win NUMERIC(14,2);

    GRANT UPDATE (min_bet, max_bet, max_win) ON games TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE games
      DROP COLUMN min_bet,
      DROP COLUMN max_bet,
      DROP COLUMN max_win;
  `);
};
