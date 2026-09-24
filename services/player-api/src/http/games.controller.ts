import { Controller, Get, Query } from '@nestjs/common';
import { GamesService } from '../games.service.js';
import type { ListGamesQueryDto } from './dto.js';
import { listGamesQuerySchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

// Public - no login required to browse the catalog, same as any real
// casino's games lobby.
@Controller('games')
export class GamesController {
  constructor(private readonly games: GamesService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listGamesQuerySchema)) query: ListGamesQueryDto) {
    return this.games.list(query.category);
  }
}
