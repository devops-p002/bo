import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PlayersService } from '../players.service.js';
import type { CreatePlayerDto, ListPlayersQueryDto, UpdatePlayerDto } from './dto.js';
import { createPlayerSchema, listPlayersQuerySchema, updatePlayerSchema } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Backs the Members section of apps/backoffice-web (search/list, profile
 * detail, and the General/Status/Contact edit modals) - any authenticated
 * admin may read or edit, matching this page's original (pre-rewrite)
 * permissiveness; unlike player-lookup.controller.ts's masked view, this
 * is a plain admin directory with no PII-masking requirement placed on
 * it. */
@Controller('players')
@UseGuards(JwtAuthGuard)
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listPlayersQuerySchema)) query: ListPlayersQueryDto) {
    const filter = {
      search: query.search,
      fullName: query.fullName,
      phone: query.phone,
      status: query.status,
      vipLevel: query.vipLevel,
      dateRange: query.dateRangeStart && query.dateRangeEnd ? { start: query.dateRangeStart, end: query.dateRangeEnd } : undefined,
      lastLoginIP: query.lastLoginIP,
      lastLoginSince: query.lastLoginSince,
      noLoginSince: query.noLoginSince,
    };
    return this.players.list(filter, { page: query.page, limit: query.limit });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.players.getById(id);
  }

  // Other players who share a device fingerprint with this one - real
  // fraud/multi-account signal from services/player-api's client-side
  // fingerprint collection (see player_devices/getLinkedAccounts).
  @Get(':id/linked-accounts')
  async getLinkedAccounts(@Param('id') id: string) {
    return this.players.getLinkedAccounts(id);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createPlayerSchema)) body: CreatePlayerDto) {
    return this.players.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(updatePlayerSchema)) body: UpdatePlayerDto) {
    return this.players.update(id, body);
  }
}
