import { loadConfig, nodeEnv, nonEmptyString, port } from '@platform/config';
import { z } from 'zod';

const schema = z.object({
  PORT: port.default(5200),
  NODE_ENV: nodeEnv,
  DATABASE_URL: nonEmptyString,

  PLAYER_JWT_SECRET: nonEmptyString,
  // Deliberately longer than backoffice-api's 900s admin token - forcing
  // a casino player back through a login screen every 15 minutes is bad
  // UX in a way it isn't for an admin session; a week is a reasonable
  // default for a cookie-based web session with real revocation behind
  // it (player_sessions), not a bare stateless JWT.
  PLAYER_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604800),

  // apps/player-web is a plain Vite SPA with no server of its own,
  // served from a different subdomain than this API - same reasoning as
  // backoffice-api's CORS_ORIGIN.
  CORS_ORIGIN: nonEmptyString.default('https://betqueen.live'),

  // KYC document uploads (front/back/selfie) - a named Docker volume in
  // production (see docker-compose.yml), never a public/static mount;
  // both this service and backoffice-api's admin review endpoint read
  // files back only through their own authenticated image routes.
  UPLOADS_DIR: nonEmptyString.default('/app/uploads/kyc'),
});

export type PlayerApiConfig = z.infer<typeof schema>;

export function loadPlayerApiConfig(source?: Record<string, string | undefined>): PlayerApiConfig {
  return loadConfig(schema, source);
}

export const PLAYER_API_CONFIG = Symbol('PLAYER_API_CONFIG');
