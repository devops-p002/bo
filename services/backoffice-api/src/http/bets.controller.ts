import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { BetsService } from '../bets.service.js';
import type { ListBetsQueryDto, UpdateBetStatusDto } from './dto.js';
import { listBetsQuerySchema, updateBetStatusSchema } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Backs the Bets section of apps/backoffice-web (Pending Bets, Bet
 * Settlement, Bet History). Read-only until a real game engine exists to
 * create rows - see bets.service.ts and the create-bets migration. */
@Controller('bets')
@UseGuards(JwtAuthGuard)
export class BetsController {
  constructor(private readonly bets: BetsService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listBetsQuerySchema)) query: ListBetsQueryDto) {
    const filter = {
      status: query.status,
      gameCategory: query.gameCategory,
      playerId: query.playerId,
      search: query.search,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      dateRange: query.dateRangeStart && query.dateRangeEnd ? { start: query.dateRangeStart, end: query.dateRangeEnd } : undefined,
    };
    return this.bets.list(filter, { page: query.page, limit: query.limit });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.bets.getById(id);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body(new ZodValidationPipe(updateBetStatusSchema)) body: UpdateBetStatusDto) {
    return this.bets.updateStatus(id, body);
  }
}
