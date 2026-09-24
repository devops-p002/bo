import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuditIndexService } from '../audit-index.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { RequireRoles, RolesGuard } from './roles.guard.js';

@Controller('audit-index')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditIndexController {
  constructor(private readonly auditIndex: AuditIndexService) {}

  @Post('poll')
  @RequireRoles('auditor')
  async poll() {
    return this.auditIndex.pollOnce();
  }

  @Get(':streamId/verify')
  @RequireRoles('auditor')
  async verify(@Param('streamId') streamId: string) {
    return this.auditIndex.verifyStream(streamId);
  }
}
