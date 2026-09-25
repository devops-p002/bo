import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from '../notifications.service.js';
import type { AuthenticatedPlayerRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  async list(@Req() req: AuthenticatedPlayerRequest) {
    return this.notifications.list(req.playerId!);
  }

  @Patch(':id/read')
  async markRead(@Req() req: AuthenticatedPlayerRequest, @Param('id') id: string) {
    await this.notifications.markRead(req.playerId!, id);
    return { ok: true };
  }
}
