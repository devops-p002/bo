'use strict';

/**
 * Backs the new KYC/identity-verification flow: apps/player-web's
 * Profile > Verification page (POST /kyc/verification via player-api)
 * and its admin review counterpart, Risk > Verification in
 * apps/backoffice-web (GET/PATCH /kyc via this service).
 *
 * Mirrors the transactions table's "player creates PENDING, only an
 * admin decides" boundary: player_api_app gets SELECT+INSERT only (and
 * every player-api query scopes by player_id, same as transactions/bets)
 * - a player can submit and read their own submission, never approve it
 * or silently overwrite a decided one. Only backoffice_api_app gets
 * UPDATE, exactly like TransactionsService.updateStatus being the only
 * path that ever changes a transaction's status.
 *
 * front/back/selfie image paths are server-side filesystem paths under
 * the kyc-uploads volume (see docker-compose.yml), never a public URL -
 * both APIs serve the bytes through their own authenticated endpoints.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kyc_verifications (
      id                 TEXT PRIMARY KEY,
      player_id          TEXT NOT NULL REFERENCES players(id),
      document_type      TEXT NOT NULL CHECK (document_type IN ('PASSPORT','DRIVERS_LICENSE','NATIONAL_ID')),
      document_number    TEXT NOT NULL,
      expiry_date        DATE NOT NULL,
      front_image_path   TEXT NOT NULL,
      back_image_path    TEXT NOT NULL,
      selfie_image_path  TEXT NOT NULL,
      status             TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
      rejection_reason   TEXT,
      reviewed_by        TEXT REFERENCES admin_users(id),
      reviewed_at        TIMESTAMPTZ,
      created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX kyc_verifications_player_id_idx ON kyc_verifications (player_id);
    CREATE INDEX kyc_verifications_status_idx ON kyc_verifications (status);
    CREATE INDEX kyc_verifications_created_at_idx ON kyc_verifications (created_at);

    GRANT SELECT, INSERT, UPDATE ON kyc_verifications TO backoffice_api_app;
    GRANT SELECT, INSERT ON kyc_verifications TO player_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON kyc_verifications FROM backoffice_api_app;
    REVOKE ALL ON kyc_verifications FROM player_api_app;
    DROP TABLE kyc_verifications;
  `);
};
