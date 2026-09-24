import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import { BreakGlassService } from '../break-glass.service.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RequireRoles, RolesGuard } from './roles.guard.js';
import type { GrantBreakGlassDto } from './dto.js';
import { grantBreakGlassSchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Granting break-glass access is super_admin-only - a fixed
 * @RequireRoles list is the right tool here (unlike maker-checker,
 * whose owning role varies per action_type), enforced by RolesGuard
 * before the handler ever runs. */
@Controller('break-glass-grants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BreakGlassController {
  constructor(private readonly breakGlass: BreakGlassService) {}

  @Post()
  @RequireRoles('super_admin')
  async grant(@Req() req: AuthenticatedAdminRequest, @Body(new ZodValidationPipe(grantBreakGlassSchema)) body: GrantBreakGlassDto) {
    if (!req.adminUserId) throw new UnauthenticatedError();
    const expiresAt = new Date(Date.now() + body.durationMinutes * 60 * 1000);
    return this.breakGlass.grant({ grantedTo: body.grantedTo, reason: body.reason, roleName: body.roleName, reviewedBy: req.adminUserId, expiresAt });
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.breakGlass.getStatus(id);
  }
}
