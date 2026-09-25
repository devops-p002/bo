'use strict';

/**
 * 20260406000018 rebranded these rows' visible name/provider from
 * "Sunrion" to "BetQueen" but deliberately left the `id` column alone,
 * reasoning it was purely internal and never shown to players. Turns out
 * it still leaked into player-facing URLs (apps/player-web links to
 * /games/game_sunrion_crash), so the brand name is visible after all -
 * this finishes the rename by moving the `id` itself.
 *
 * `id` is referenced by bets.game_id (REFERENCES games(id), not
 * DEFERRABLE), so a plain UPDATE games SET id = ... would fail the instant
 * it ran while any bet still pointed at the old id. Instead: insert a new
 * row under the new id (copying every other column), repoint any
 * referencing bets rows at it, then drop the old row - at every step the
 * referenced row a bets row points at still exists.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_betqueen_crash', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_sunrion_crash';
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_betqueen_mines', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_sunrion_mines';
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_betqueen_dice', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_sunrion_dice';

    UPDATE bets SET game_id = 'game_betqueen_crash' WHERE game_id = 'game_sunrion_crash';
    UPDATE bets SET game_id = 'game_betqueen_mines' WHERE game_id = 'game_sunrion_mines';
    UPDATE bets SET game_id = 'game_betqueen_dice'  WHERE game_id = 'game_sunrion_dice';

    DELETE FROM games WHERE id = 'game_sunrion_crash';
    DELETE FROM games WHERE id = 'game_sunrion_mines';
    DELETE FROM games WHERE id = 'game_sunrion_dice';
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_sunrion_crash', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_betqueen_crash';
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_sunrion_mines', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_betqueen_mines';
    INSERT INTO games (id, name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win)
      SELECT 'game_sunrion_dice', name, category, provider, thumbnail_url, is_active, created_at, min_bet, max_bet, max_win
      FROM games WHERE id = 'game_betqueen_dice';

    UPDATE bets SET game_id = 'game_sunrion_crash' WHERE game_id = 'game_betqueen_crash';
    UPDATE bets SET game_id = 'game_sunrion_mines' WHERE game_id = 'game_betqueen_mines';
    UPDATE bets SET game_id = 'game_sunrion_dice'  WHERE game_id = 'game_betqueen_dice';

    DELETE FROM games WHERE id = 'game_betqueen_crash';
    DELETE FROM games WHERE id = 'game_betqueen_mines';
    DELETE FROM games WHERE id = 'game_betqueen_dice';
  `);
};
