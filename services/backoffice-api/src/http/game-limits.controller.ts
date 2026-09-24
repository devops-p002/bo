import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { GameLimitsService } from '../game-limits.service.js';
import type { ListGamesQueryDto, UpdateGameLimitsDto } from './dto.js';
import { listGamesQuerySchema, updateGameLimitsSchema } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Backs the Bets section's "Bet Limits" tab only - not full CMS games
 * CRUD (CLAUDE.md phase 7, not yet built). See game-limits.service.ts. */
@Controller('games')
@UseGuards(JwtAuthGuard)
export class GameLimitsController {
  constructor(private readonly gameLimits: GameLimitsService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listGamesQuerySchema)) query: ListGamesQueryDto) {
    return this.gameLimits.list({ category: query.category });
  }

  @Patch(':id/limits')
  async updateLimits(@Param('id') id: string, @Body(new ZodValidationPipe(updateGameLimitsSchema)) body: UpdateGameLimitsDto) {
    return this.gameLimits.updateLimits(id, body);
  }
}
