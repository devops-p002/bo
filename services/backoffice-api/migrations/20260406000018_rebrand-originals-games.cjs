'use strict';

/**
 * The three ORIGINALS rows seeded by 20260406000016_create-games.cjs used
 * the "Sunrion" brand name, which has since been replaced by "BetQueen"
 * (apps/player-web, CLAUDE.md). That migration already ran in production,
 * so this renames the rows in place rather than editing it. ids are left
 * as-is - internal identifiers, not shown to players.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    UPDATE games SET name = 'BetQueen Crash', provider = 'BetQueen Originals' WHERE id = 'game_sunrion_crash';
    UPDATE games SET name = 'BetQueen Mines', provider = 'BetQueen Originals' WHERE id = 'game_sunrion_mines';
    UPDATE games SET name = 'BetQueen Dice',  provider = 'BetQueen Originals' WHERE id = 'game_sunrion_dice';
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    UPDATE games SET name = 'Sunrion Crash', provider = 'Sunrion Originals' WHERE id = 'game_sunrion_crash';
    UPDATE games SET name = 'Sunrion Mines', provider = 'Sunrion Originals' WHERE id = 'game_sunrion_mines';
    UPDATE games SET name = 'Sunrion Dice',  provider = 'Sunrion Originals' WHERE id = 'game_sunrion_dice';
  `);
};
