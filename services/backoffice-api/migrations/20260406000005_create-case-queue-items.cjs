'use strict';

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE case_queue_items (
      id             TEXT PRIMARY KEY,
      queue_type     TEXT NOT NULL CHECK (queue_type IN ('maker_checker', 'risk_review', 'kyc_review')),
      reference_id   TEXT NOT NULL,
      status         TEXT NOT NULL CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
      assigned_to    TEXT REFERENCES admin_users (id),
      resolved_by    TEXT REFERENCES admin_users (id),
      notes          TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
      resolved_at    TIMESTAMPTZ
    );

    CREATE INDEX case_queue_items_queue_type_status_idx ON case_queue_items (queue_type, status);
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE case_queue_items;');
};
