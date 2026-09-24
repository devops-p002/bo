'use strict';

/**
 * The eight roles (PLAN.md Phase 6: "RBAC (eight roles)"). Chosen for
 * this platform's domain since PLAN.md defers the exact list to an
 * external spec this codebase doesn't have a copy of - documented here
 * and in platform/CLAUDE.md rather than left implicit:
 *
 *   super_admin          - unrestricted; can create/approve any
 *                           maker-checker request, grant break-glass.
 *   finance               - owns balance_adjustment and payout requests.
 *   trading                - owns manual_settlement and odds_override
 *                           requests.
 *   responsible_gambling   - owns limit_change requests.
 *   auditor                - owns export requests; read-only everywhere
 *                           else (audit-index, case queues).
 *   risk_compliance         - reviews risk/KYC/AML case-queue items.
 *   support                 - read-only player/case access; explicitly
 *                           NEVER an owning role for any maker-checker
 *                           action type - this is the role the Phase 6
 *                           acceptance criterion's 403 test uses.
 *   marketing               - manages bonus templates (not maker-checker
 *                           gated - see services/bonus's own open
 *                           POST /bonus-templates).
 */
/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE admin_roles (
      id   TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    INSERT INTO admin_roles (id, name) VALUES
      ('role_super_admin', 'super_admin'),
      ('role_finance', 'finance'),
      ('role_trading', 'trading'),
      ('role_responsible_gambling', 'responsible_gambling'),
      ('role_auditor', 'auditor'),
      ('role_risk_compliance', 'risk_compliance'),
      ('role_support', 'support'),
      ('role_marketing', 'marketing');
  `);
};

/** @param {import('node-pg-migrate').MigrationBuilder} pgm */
exports.down = (pgm) => {
  pgm.sql('DROP TABLE admin_roles;');
};
