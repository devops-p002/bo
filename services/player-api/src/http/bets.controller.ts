import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { BetsService } from '../bets.service.js';
import type { AuthenticatedPlayerRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly bets: BetsService) {}

  @Get()
  async listMine(@Req() req: AuthenticatedPlayerRequest) {
    return this.bets.listMyBets(req.playerId!);
  }
}
