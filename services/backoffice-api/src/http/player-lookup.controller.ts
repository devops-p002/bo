import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import { PlayerLookupService } from '../player-lookup.service.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RequireRoles, RolesGuard } from './roles.guard.js';
import type { UnmaskPlayerDto } from './dto.js';
import { unmaskPlayerSchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/**
 * GET returns a masked view to any authenticated admin - it reveals no
 * PII (see PlayerLookupService's maskEmail), so no @RequireRoles is
 * needed beyond "is a real admin". Unmasking is the sensitive
 * operation: gated to the roles that actually investigate players
 * (support, risk_compliance - the roles this platform's case queues
 * route work to), always with a reason, always audited before the
 * value is returned (see PlayerLookupService.unmask's own comment) -
 * this is Phase 7's "unmasking PII always writes an audit event with
 * a reason before the API returns the unmasked value" acceptance
 * criterion.
 */
@Controller('player-lookup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlayerLookupController {
  constructor(private readonly playerLookup: PlayerLookupService) {}

  @Get(':playerId')
  async getMasked(@Param('playerId') playerId: string) {
    return this.playerLookup.getMasked(playerId);
  }

  @Post(':playerId/unmask')
  @RequireRoles('support', 'risk_compliance')
  async unmask(@Req() req: AuthenticatedAdminRequest, @Param('playerId') playerId: string, @Body(new ZodValidationPipe(unmaskPlayerSchema)) body: UnmaskPlayerDto) {
    if (!req.adminUserId) throw new UnauthenticatedError();
    return this.playerLookup.unmask(playerId, req.adminUserId, body.reason);
  }
}
