'use strict';

/**
 * A real, admin-manageable games catalog backing both apps/player-web's
 * games grid and the eventual CMS > Games admin page (CLAUDE.md phase
 * 7 - still pending; this table is what that phase will wire to, not a
 * new one). No real game engine exists yet - a player can browse and
 * open a game's detail placeholder, but there's no spin/deal/round
 * logic anywhere in this repo. thumbnail_url is nullable and unseeded
 * on purpose: there's no real asset host to point at yet, so the
 * frontend renders an honest name/category placeholder card instead of
 * a broken or fabricated image link.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE games (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      category       TEXT NOT NULL CHECK (category IN ('SLOTS','LIVE_CASINO','GAME_SHOWS','TABLE_GAMES','ORIGINALS')),
      provider       TEXT NOT NULL DEFAULT 'In-House',
      thumbnail_url  TEXT,
      is_active      BOOLEAN NOT NULL DEFAULT true,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX games_category_idx ON games (category);

    INSERT INTO games (id, name, category, provider) VALUES
      ('game_neon_fortune',     'Neon Fortune',        'SLOTS',       'In-House'),
      ('game_crypto_blitz',     'Crypto Blitz',        'SLOTS',       'In-House'),
      ('game_wild_reef',        'Wild Reef',           'SLOTS',       'In-House'),
      ('game_golden_temple',    'Golden Temple',       'SLOTS',       'In-House'),
      ('game_starlight_spins',  'Starlight Spins',     'SLOTS',       'In-House'),
      ('game_dragon_hoard',     'Dragon''s Hoard',     'SLOTS',       'In-House'),
      ('game_live_blackjack',   'Live Blackjack',      'LIVE_CASINO', 'In-House'),
      ('game_live_roulette',    'Live Roulette',       'LIVE_CASINO', 'In-House'),
      ('game_live_baccarat',    'Live Baccarat',       'LIVE_CASINO', 'In-House'),
      ('game_crash_wheel',      'Crash Wheel',         'GAME_SHOWS',  'In-House'),
      ('game_plinko_drop',      'Plinko Drop',         'GAME_SHOWS',  'In-House'),
      ('game_wheel_of_fortune', 'Wheel of Fortune',    'GAME_SHOWS',  'In-House'),
      ('game_classic_blackjack','Classic Blackjack',   'TABLE_GAMES', 'In-House'),
      ('game_european_roulette','European Roulette',   'TABLE_GAMES', 'In-House'),
      ('game_texas_holdem',     'Texas Hold''em',      'TABLE_GAMES', 'In-House'),
      ('game_sunrion_crash',    'Sunrion Crash',       'ORIGINALS',   'Sunrion Originals'),
      ('game_sunrion_mines',    'Sunrion Mines',       'ORIGINALS',   'Sunrion Originals'),
      ('game_sunrion_dice',     'Sunrion Dice',        'ORIGINALS',   'Sunrion Originals');

    GRANT SELECT ON games TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON games FROM backoffice_api_app;
    DROP TABLE games;
  `);
};
