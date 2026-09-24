import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import type { FastifyRequest } from 'fastify';
import { BACKOFFICE_CONFIG } from '../config.js';
import type { BackofficeConfig } from '../config.js';
import { verifyAdminAccessToken } from '../jwt.js';

export interface AuthenticatedAdminRequest extends FastifyRequest {
  adminUserId?: string;
  roles?: string[];
}

/** Verifies the caller's admin access token and attaches
 * adminUserId/roles to the request - every RBAC decision downstream
 * reads `req.roles`, set here after real signature/issuer/audience
 * verification, never a client-supplied header. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(BACKOFFICE_CONFIG) private readonly config: BackofficeConfig) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthenticatedError('Missing bearer token');
    }

    const token = header.slice('Bearer '.length).trim();
    const claims = await verifyAdminAccessToken(token, this.config.ADMIN_JWT_SECRET);
    request.adminUserId = claims.adminUserId;
    request.roles = claims.roles;
    return true;
  }
}
