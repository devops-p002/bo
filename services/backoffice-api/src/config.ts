import { loadConfig, nodeEnv, nonEmptyString, port, url } from '@platform/config';
import { z } from 'zod';

const schema = z.object({
  PORT: port.default(5000),
  NODE_ENV: nodeEnv,
  DATABASE_URL: nonEmptyString,

  ADMIN_JWT_SECRET: nonEmptyString,
  ADMIN_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),

  // apps/backoffice-web is a plain Vite SPA with no server of its own,
  // served from a different subdomain than this API - the browser needs
  // an explicit CORS allow-list (with credentials, for the session
  // cookie) rather than same-origin trust a Next.js API-route proxy
  // would have given it.
  CORS_ORIGIN: nonEmptyString.default('https://admin.sunrion.online'),

  // Downstream services maker-checker approval actually executes
  // against.
  LEDGER_BASE_URL: url.default('http://localhost:4100'),
  SPORTSBOOK_BASE_URL: url.default('http://localhost:4500'),
  RESPONSIBLE_GAMBLING_BASE_URL: url.default('http://localhost:4800'),

  // services/account's internal GET /admin/players/:id - the backing
  // lookup for player-lookup.service.ts's masked view / audited
  // unmask (Phase 7's PII-masking acceptance criterion).
  ACCOUNT_BASE_URL: url.default('http://localhost:4200'),

  // Every service audit-index polls GET /audit-events on (see
  // platform/CLAUDE.md for why this is a polling substitute for the
  // Redis Streams outbox PLAN.md describes).
  LEDGER_AUDIT_URL: url.default('http://localhost:4100'),
  ACCOUNT_AUDIT_URL: url.default('http://localhost:4200'),
  CRYPTO_AUDIT_URL: url.default('http://localhost:4300'),
  GAME_WALLET_AUDIT_URL: url.default('http://localhost:4400'),
  SPORTSBOOK_AUDIT_URL: url.default('http://localhost:4500'),
  BONUS_AUDIT_URL: url.default('http://localhost:4700'),
  RESPONSIBLE_GAMBLING_AUDIT_URL: url.default('http://localhost:4800'),
  RISK_AUDIT_URL: url.default('http://localhost:4900'),
});

export type BackofficeConfig = z.infer<typeof schema>;

export function loadBackofficeConfig(source?: Record<string, string | undefined>): BackofficeConfig {
  return loadConfig(schema, source);
}

export const BACKOFFICE_CONFIG = Symbol('BACKOFFICE_CONFIG');
