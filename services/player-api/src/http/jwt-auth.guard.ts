import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import type { FastifyRequest } from 'fastify';
import { PlayerAuthService } from '../player-auth.service.js';
import { SESSION_COOKIE_NAME } from './tokens.js';

export interface AuthenticatedPlayerRequest extends FastifyRequest {
  playerId?: string;
  sessionId?: string;
}

/** Mirrors services/backoffice-api's JwtAuthGuard: verifies either a
 * Bearer header or the httpOnly session cookie apps/player-web's browser
 * session relies on, and attaches playerId/sessionId to the request. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly playerAuth: PlayerAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedPlayerRequest>();
    const header = request.headers.authorization;

    let token: string | undefined;
    if (header?.startsWith('Bearer ')) {
      token = header.slice('Bearer '.length).trim();
    } else {
      token = request.cookies?.[SESSION_COOKIE_NAME];
    }

    if (!token) {
      throw new UnauthenticatedError('Missing bearer token or session cookie');
    }

    const claims = await this.playerAuth.verifyToken(token);
    request.playerId = claims.playerId;
    request.sessionId = claims.sessionId;
    return true;
  }
}
