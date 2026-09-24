'use strict';

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE member_groups (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL UNIQUE,
      category     TEXT,
      status       TEXT NOT NULL CHECK (status IN ('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE member_group_members (
      group_id     TEXT NOT NULL REFERENCES member_groups(id) ON DELETE CASCADE,
      player_id    TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      added_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (group_id, player_id)
    );

    GRANT SELECT, INSERT, UPDATE, DELETE ON member_groups TO backoffice_api_app;
    GRANT SELECT, INSERT, DELETE ON member_group_members TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON member_group_members FROM backoffice_api_app;
    REVOKE ALL ON member_groups FROM backoffice_api_app;
    DROP TABLE member_group_members;
    DROP TABLE member_groups;
  `);
};
