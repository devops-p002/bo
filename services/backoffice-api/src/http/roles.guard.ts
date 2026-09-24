import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionDeniedError, UnauthenticatedError } from '@platform/errors';
import type { Role } from '../roles.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';

export const REQUIRED_ROLES_KEY = 'requiredRoles';

/** Marks a handler as requiring at least one of the given roles (or
 * super_admin, always). Must be paired with @UseGuards(JwtAuthGuard,
 * RolesGuard) - JwtAuthGuard runs first and sets req.roles from the
 * verified token. */
export const RequireRoles = (...roles: Role[]) => SetMetadata(REQUIRED_ROLES_KEY, roles);

/** Enforces @RequireRoles server-side - a support-role token calling an
 * endpoint marked @RequireRoles('finance') gets a real 403 here, not
 * just a hidden button in a UI that doesn't exist yet (see PLAN.md
 * Phase 6's acceptance criterion). */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<Role[] | undefined>(REQUIRED_ROLES_KEY, context.getHandler());
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedAdminRequest>();
    const roles = request.roles;
    if (!roles) throw new UnauthenticatedError();

    if (roles.includes('super_admin') || required.some((r) => roles.includes(r))) {
      return true;
    }

    throw new PermissionDeniedError(`Requires one of: ${required.join(', ')}`);
  }
}
