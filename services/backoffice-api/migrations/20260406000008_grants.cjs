'use strict';

/**
 * audit_index gets SELECT+INSERT only, ever - same append-only pattern
 * as every other service's audit_events table; nothing here can ever
 * edit a row once ingested. maker_checker_requests and
 * break_glass_grants get UPDATE because their lifecycle fields
 * (status/approved_by/decided_at, though a grant itself is otherwise
 * static) are meant to change through normal service operation - the
 * `requested_by <> approved_by` CHECK constraint (not a withheld
 * grant) is what makes maker-checker's core guarantee unconditional.
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    GRANT USAGE ON SCHEMA public TO backoffice_api_app;

    GRANT SELECT, INSERT, UPDATE ON admin_users TO backoffice_api_app;
    GRANT SELECT ON admin_roles TO backoffice_api_app;
    GRANT SELECT, INSERT ON role_assignments TO backoffice_api_app;
    GRANT SELECT, INSERT, UPDATE ON maker_checker_requests TO backoffice_api_app;
    GRANT SELECT, INSERT, UPDATE ON case_queue_items TO backoffice_api_app;
    GRANT SELECT, INSERT ON break_glass_grants TO backoffice_api_app;
    GRANT SELECT, INSERT ON audit_index TO backoffice_api_app;
    GRANT SELECT, INSERT, UPDATE ON audit_index_watermarks TO backoffice_api_app;
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql(`
    REVOKE ALL ON admin_users FROM backoffice_api_app;
    REVOKE ALL ON admin_roles FROM backoffice_api_app;
    REVOKE ALL ON role_assignments FROM backoffice_api_app;
    REVOKE ALL ON maker_checker_requests FROM backoffice_api_app;
    REVOKE ALL ON case_queue_items FROM backoffice_api_app;
    REVOKE ALL ON break_glass_grants FROM backoffice_api_app;
    REVOKE ALL ON audit_index FROM backoffice_api_app;
    REVOKE ALL ON audit_index_watermarks FROM backoffice_api_app;
    REVOKE USAGE ON SCHEMA public FROM backoffice_api_app;
  `);
};
