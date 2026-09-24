import { UnauthenticatedError } from '@platform/errors';
import { SignJWT, errors as joseErrors, jwtVerify } from 'jose';

// A distinct issuer/audience from services/account's player tokens
// (platform-account/account-api) - a stolen player token must never
// verify here, and vice versa, even if the two secrets were ever
// mistakenly reused (they aren't - see config.ts's own
// ADMIN_JWT_SECRET).
const ISSUER = 'platform-backoffice';
const AUDIENCE = 'backoffice-api';

export interface AdminAccessTokenClaims {
  adminUserId: string;
  roles: string[];
  sessionId: string;
}

export async function signAdminAccessToken(claims: AdminAccessTokenClaims, secret: string, ttlSeconds: number): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ roles: claims.roles, sid: claims.sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.adminUserId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(key);
}

export async function verifyAdminAccessToken(token: string, secret: string): Promise<AdminAccessTokenClaims> {
  const key = new TextEncoder().encode(secret);
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sub !== 'string' || !Array.isArray(payload.roles) || typeof payload.sid !== 'string') {
      throw new UnauthenticatedError('Invalid access token');
    }
    return { adminUserId: payload.sub, roles: payload.roles as string[], sessionId: payload.sid };
  } catch (err) {
    if (err instanceof UnauthenticatedError) throw err;
    if (err instanceof joseErrors.JOSEError) {
      throw new UnauthenticatedError('Invalid access token', { cause: err });
    }
    throw err;
  }
}
