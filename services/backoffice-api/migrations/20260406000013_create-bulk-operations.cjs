'use strict';

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE bulk_operations (
      id               TEXT PRIMARY KEY,
      operation_type   TEXT NOT NULL CHECK (operation_type IN ('STATUS_CHANGE','VIP_LEVEL_UPDATE','BALANCE_ADJUSTMENT')),
      value            TEXT NOT NULL,
      affected_count   INTEGER NOT NULL DEFAULT 0,
      status           TEXT NOT NULL CHECK (status IN ('PENDING','COMPLETED','FAILED')) DEFAULT 'PENDING',
      error_message    TEXT,
      created_by       TEXT NOT NULL REFERENCES admin_users(id),
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      completed_at     TIMESTAMPTZ
    );

    GRANT SELECT, INSERT, UPDATE ON bulk_operations TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON bulk_operations FROM backoffice_api_app;
    DROP TABLE bulk_operations;
  `);
};
