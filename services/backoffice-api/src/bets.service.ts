import { NotFoundError } from '@platform/errors';
import type { Kysely } from 'kysely';
import type { BetStatus, Database, GameCategory } from './db/schema.js';

export interface BetListFilter {
  status?: BetStatus | undefined;
  gameCategory?: GameCategory | undefined;
  playerId?: string | undefined;
  search?: string | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  dateRange?: { start: string; end: string } | undefined;
}

export interface BetListPagination {
  page: number;
  limit: number;
}

export interface UpdateBetStatusInput {
  status: BetStatus;
  winAmount?: number | undefined;
  result?: unknown;
  voidReason?: string | undefined;
}

function toApiShape(row: {
  id: string;
  player_id: string;
  username: string | null;
  game_id: string;
  game_name: string | null;
  game_category: GameCategory | null;
  game_provider: string | null;
  type: string;
  status: BetStatus;
  amount: string;
  currency: string;
  odds: string | null;
  potential_win: string;
  win_amount: string | null;
  risk_score: number;
  risk_flags: string[];
  ip_address: string | null;
  selections: unknown;
  result: unknown;
  void_reason: string | null;
  created_at: Date;
  settled_at: Date | null;
}) {
  return {
    id: row.id,
    playerId: row.player_id,
    username: row.username,
    gameId: row.game_id,
    gameName: row.game_name,
    gameCategory: row.game_category,
    gameProvider: row.game_provider,
    type: row.type,
    status: row.status,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    odds: row.odds === null ? null : Number.parseFloat(row.odds),
    potentialWin: Number.parseFloat(row.potential_win),
    winAmount: row.win_amount === null ? null : Number.parseFloat(row.win_amount),
    riskScore: row.risk_score,
    riskFlags: row.risk_flags,
    ipAddress: row.ip_address,
    selections: row.selections,
    result: row.result,
    voidReason: row.void_reason,
    createdAt: row.created_at.toISOString(),
    settledAt: row.settled_at === null ? null : row.settled_at.toISOString(),
  };
}

// Deliberately no create() - nothing in this repo places real bets yet
// (no game engine in apps/player-web). See the create-bets migration's
// comment for why this table is real but starts, and stays, empty.
export class BetsService {
  constructor(private readonly db: Kysely<Database>) {}

  private baseQuery() {
    return this.db
      .selectFrom('bets')
      .innerJoin('players', 'players.id', 'bets.player_id')
      .innerJoin('games', 'games.id', 'bets.game_id')
      .select([
        'bets.id as id',
        'bets.player_id as player_id',
        'players.username as username',
        'bets.game_id as game_id',
        'games.name as game_name',
        'games.category as game_category',
        'games.provider as game_provider',
        'bets.type as type',
        'bets.status as status',
        'bets.amount as amount',
        'bets.currency as currency',
        'bets.odds as odds',
        'bets.potential_win as potential_win',
        'bets.win_amount as win_amount',
        'bets.risk_score as risk_score',
        'bets.risk_flags as risk_flags',
        'bets.ip_address as ip_address',
        'bets.selections as selections',
        'bets.result as result',
        'bets.void_reason as void_reason',
        'bets.created_at as created_at',
        'bets.settled_at as settled_at',
      ]);
  }

  private applyFilter<Q extends { where: any }>(query: Q, filter: BetListFilter): Q {
    let q = query;
    if (filter.status) q = q.where('bets.status', '=', filter.status);
    if (filter.gameCategory) q = q.where('games.category', '=', filter.gameCategory);
    if (filter.playerId) q = q.where('bets.player_id', '=', filter.playerId);
    if (filter.minAmount !== undefined) q = q.where('bets.amount', '>=', String(filter.minAmount));
    if (filter.maxAmount !== undefined) q = q.where('bets.amount', '<=', String(filter.maxAmount));
    if (filter.dateRange) {
      q = q.where('bets.created_at', '>=', new Date(filter.dateRange.start)).where('bets.created_at', '<=', new Date(filter.dateRange.end));
    }
    if (filter.search) {
      const term = `%${filter.search}%`;
      q = q.where((eb: any) => eb.or([eb('players.username', 'ilike', term), eb('bets.id', 'ilike', term)]));
    }
    return q;
  }

  async list(filter: BetListFilter, pagination: BetListPagination) {
    const query = this.applyFilter(this.baseQuery(), filter);
    const countQuery = this.applyFilter(
      this.db.selectFrom('bets').innerJoin('players', 'players.id', 'bets.player_id').innerJoin('games', 'games.id', 'bets.game_id'),
      filter,
    );

    const totalRow = await countQuery.select((eb) => eb.fn.countAll<string>().as('count')).executeTakeFirstOrThrow();
    const totalCount = Number.parseInt(totalRow.count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await query.orderBy('bets.created_at', 'desc').limit(pagination.limit).offset(offset).execute();

    return { totalCount, nodes: rows.map(toApiShape) };
  }

  async getById(id: string) {
    const row = await this.baseQuery().where('bets.id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`Bet ${id} not found`);
    return toApiShape(row);
  }

  // No balance side effects here - see the create-bets migration's comment
  // on why settlement stays record-keeping only until a real game engine
  // (and its own wager-placement debit) exists.
  async updateStatus(id: string, input: UpdateBetStatusInput) {
    const existing = await this.db.selectFrom('bets').select('status').where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Bet ${id} not found`);

    const isTerminal = input.status !== 'PENDING';
    await this.db
      .updateTable('bets')
      .set({
        status: input.status,
        win_amount: input.winAmount !== undefined ? String(input.winAmount) : undefined,
        result: input.result !== undefined ? JSON.stringify(input.result) : undefined,
        void_reason: input.voidReason ?? undefined,
        settled_at: isTerminal && existing.status === 'PENDING' ? new Date() : undefined,
      })
      .where('id', '=', id)
      .execute();

    return this.getById(id);
  }
}
