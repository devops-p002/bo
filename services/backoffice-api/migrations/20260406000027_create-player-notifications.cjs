'use strict';

/**
 * Narrow, purpose-built table for one real event: a player's Profile >
 * Notifications page needs something real to show when backoffice-api's
 * admin KYC review rejects a submission (see kyc.service.ts's
 * updateStatus). `type` stays an open TEXT rather than an enum so a
 * later real event can reuse the table, but KYC_REJECTED is the only
 * value anything writes today - this is not a general notification
 * system, see CLAUDE.md rule #5.
 *
 * Same admin-writes/player-reads split as kyc_verifications: only
 * backoffice_api_app can INSERT (it's the one deciding KYC outcomes),
 * player_api_app gets SELECT + UPDATE (marking a player's own
 * notification read) scoped by player_id in every query.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE player_notifications (
      id          TEXT PRIMARY KEY,
      player_id   TEXT NOT NULL REFERENCES players(id),
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      body        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      read_at     TIMESTAMPTZ
    );

    CREATE INDEX player_notifications_player_id_idx ON player_notifications (player_id);
    CREATE INDEX player_notifications_created_at_idx ON player_notifications (created_at);

    GRANT SELECT, INSERT ON player_notifications TO backoffice_api_app;
    GRANT SELECT, UPDATE ON player_notifications TO player_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON player_notifications FROM backoffice_api_app;
    REVOKE ALL ON player_notifications FROM player_api_app;
    DROP TABLE player_notifications;
  `);
};
