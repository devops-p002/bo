import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import { CaseQueueService } from '../case-queue.service.js';
import type { QueueType } from '../case-queue.service.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { ResolveCaseItemDto } from './dto.js';
import { resolveCaseItemSchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('case-queue-items')
@UseGuards(JwtAuthGuard)
export class CaseQueueController {
  constructor(private readonly caseQueue: CaseQueueService) {}

  @Get()
  async list(@Query('queueType') queueType?: string) {
    return this.caseQueue.list(queueType as QueueType | undefined);
  }

  @Post(':id/resolve')
  async resolve(@Req() req: AuthenticatedAdminRequest, @Param('id') id: string, @Body(new ZodValidationPipe(resolveCaseItemSchema)) body: ResolveCaseItemDto) {
    if (!req.adminUserId) throw new UnauthenticatedError();
    return this.caseQueue.resolve(id, req.adminUserId, body.notes);
  }
}
