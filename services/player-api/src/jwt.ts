import { UnauthenticatedError } from '@platform/errors';
import { SignJWT, errors as joseErrors, jwtVerify } from 'jose';

// A distinct issuer/audience from services/backoffice-api's admin tokens
// - a stolen player token must never verify as an admin token, and vice
// versa, even if the two JWT secrets were ever mistakenly reused (they
// aren't - PLAYER_JWT_SECRET is its own config value).
const ISSUER = 'platform-player';
const AUDIENCE = 'player-api';

export interface PlayerAccessTokenClaims {
  playerId: string;
  sessionId: string;
}

export async function signPlayerAccessToken(claims: PlayerAccessTokenClaims, secret: string, ttlSeconds: number): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ sid: claims.sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.playerId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(key);
}

export async function verifyPlayerAccessToken(token: string, secret: string): Promise<PlayerAccessTokenClaims> {
  const key = new TextEncoder().encode(secret);
  try {
    const { payload } = await jwtVerify(token, key, { issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') {
      throw new UnauthenticatedError('Invalid access token');
    }
    return { playerId: payload.sub, sessionId: payload.sid };
  } catch (err) {
    if (err instanceof UnauthenticatedError) throw err;
    if (err instanceof joseErrors.JOSEError) {
      throw new UnauthenticatedError('Invalid access token', { cause: err });
    }
    throw err;
  }
}
