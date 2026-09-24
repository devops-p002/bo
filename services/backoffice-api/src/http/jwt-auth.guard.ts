import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import type { FastifyRequest } from 'fastify';
import { AdminAuthService } from '../admin-auth.service.js';
import { SESSION_COOKIE_NAME } from './tokens.js';

export interface AuthenticatedAdminRequest extends FastifyRequest {
  adminUserId?: string;
  roles?: string[];
  sessionId?: string;
}

/** Verifies the caller's admin access token - either a Bearer header
 * (API clients, and every existing integration test) or the httpOnly
 * session cookie apps/backoffice-web's browser session relies on (a
 * pure SPA with no server of its own to attach a header from) - and
 * attaches adminUserId/roles/sessionId to the request. Every RBAC
 * decision downstream reads `req.roles`, set here only after real
 * signature/issuer/audience verification AND a live, non-revoked
 * admin_sessions row (AdminAuthService.verifyToken) - a signature-valid
 * JWT for a session that was since logged out is rejected, not just one
 * that's past its own exp claim. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly adminAuth: AdminAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();
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

    const claims = await this.adminAuth.verifyToken(token);
    request.adminUserId = claims.adminUserId;
    request.roles = claims.roles;
    request.sessionId = claims.sessionId;
    return true;
  }
}
