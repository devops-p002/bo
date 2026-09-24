'use strict';

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE role_assignments (
      admin_user_id TEXT NOT NULL REFERENCES admin_users (id),
      role_id       TEXT NOT NULL REFERENCES admin_roles (id),
      assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (admin_user_id, role_id)
    );
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE role_assignments;');
};
