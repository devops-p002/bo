import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import { MakerCheckerService } from '../maker-checker.service.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { CreateMakerCheckerRequestDto } from './dto.js';
import { createMakerCheckerRequestSchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

function requireAdmin(req: AuthenticatedAdminRequest): { adminUserId: string; roles: string[] } {
  if (!req.adminUserId || !req.roles) throw new UnauthenticatedError();
  return { adminUserId: req.adminUserId, roles: req.roles };
}

/**
 * RBAC for maker-checker is per-action-type (see roles.ts's
 * ACTION_TYPE_OWNING_ROLE), not a single fixed @RequireRoles list -
 * MakerCheckerService itself checks the caller's roles against the
 * request's own action_type and throws PermissionDeniedError (403) if
 * they don't own it. A support-role token calling create/approve on a
 * balance_adjustment or payout request always gets that 403 here - see
 * PLAN.md Phase 6's acceptance criterion.
 */
@Controller('maker-checker-requests')
@UseGuards(JwtAuthGuard)
export class MakerCheckerController {
  constructor(private readonly makerChecker: MakerCheckerService) {}

  @Post()
  async create(@Req() req: AuthenticatedAdminRequest, @Body(new ZodValidationPipe(createMakerCheckerRequestSchema)) body: CreateMakerCheckerRequestDto) {
    const { adminUserId, roles } = requireAdmin(req);
    return this.makerChecker.createRequest({ actionType: body.actionType, payload: body.payload, requestedBy: adminUserId, requesterRoles: roles });
  }

  @Get()
  async list() {
    return this.makerChecker.listRequests();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.makerChecker.getRequest(id);
  }

  @Post(':id/approve')
  async approve(@Req() req: AuthenticatedAdminRequest, @Param('id') id: string) {
    const { adminUserId, roles } = requireAdmin(req);
    return this.makerChecker.approve(id, adminUserId, roles);
  }

  @Post(':id/reject')
  async reject(@Req() req: AuthenticatedAdminRequest, @Param('id') id: string) {
    const { adminUserId, roles } = requireAdmin(req);
    return this.makerChecker.reject(id, adminUserId, roles);
  }
}
