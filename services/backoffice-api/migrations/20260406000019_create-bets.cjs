'use strict';

/**
 * Backs the Bets section of apps/backoffice-web (Pending Bets, Bet
 * Settlement, Bet History). Unlike transactions, nothing creates bets yet -
 * there's no real game engine in apps/player-web (a game's detail page is
 * still an honest "not wired up" placeholder), so this table starts empty
 * and stays that way until a real gameplay flow exists to insert rows.
 * Built now anyway so the admin CRUD (list/settle/cancel/void) is real and
 * ready rather than mocked, per the same "wire to real data, don't fabricate"
 * rule the rest of this app follows - an empty real table beats a populated
 * fake one.
 *
 * Settlement here deliberately does NOT touch players.balance. Crediting a
 * win would need a matching debit when the bet was placed, and there is no
 * real placement flow to pair it with yet - that belongs to a future
 * game-wallet-style service wired to the eventual game engine, not to
 * admin backoffice CRUD. This table is bet record-keeping only for now.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE bets (
      id             TEXT PRIMARY KEY,
      player_id      TEXT NOT NULL REFERENCES players(id),
      game_id        TEXT NOT NULL REFERENCES games(id),
      type           TEXT NOT NULL,
      status         TEXT NOT NULL CHECK (status IN ('PENDING','SETTLED','PARTIALLY_SETTLED','CANCELLED','VOID')) DEFAULT 'PENDING',
      amount         NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      currency       TEXT NOT NULL DEFAULT 'USD',
      odds           NUMERIC(10,4),
      potential_win  NUMERIC(14,2) NOT NULL DEFAULT 0,
      win_amount     NUMERIC(14,2),
      risk_score     INTEGER NOT NULL DEFAULT 0,
      risk_flags     JSONB NOT NULL DEFAULT '[]'::jsonb,
      ip_address     TEXT,
      selections     JSONB,
      result         JSONB,
      void_reason    TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      settled_at     TIMESTAMPTZ
    );

    CREATE INDEX bets_player_id_idx ON bets (player_id);
    CREATE INDEX bets_game_id_idx ON bets (game_id);
    CREATE INDEX bets_status_idx ON bets (status);
    CREATE INDEX bets_created_at_idx ON bets (created_at);

    -- No INSERT grant: nothing in this service creates bets - see comment
    -- above. Only SELECT (list/history) and UPDATE (settle/cancel/void).
    GRANT SELECT, UPDATE ON bets TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON bets FROM backoffice_api_app;
    DROP TABLE bets;
  `);
};
