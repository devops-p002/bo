import { NotFoundError } from '@platform/errors';
import type { Kysely } from 'kysely';
import type { Database, GameCategory } from './db/schema.js';

export interface GameListFilter {
  category?: GameCategory | undefined;
}

export interface UpdateGameLimitsInput {
  minBet?: number | undefined;
  maxBet?: number | undefined;
  maxWin?: number | undefined;
}

function toApiShape(row: {
  id: string;
  name: string;
  category: GameCategory;
  provider: string;
  is_active: boolean;
  min_bet: string | null;
  max_bet: string | null;
  max_win: string | null;
}) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    provider: row.provider,
    status: row.is_active ? 'ACTIVE' : 'INACTIVE',
    minBet: row.min_bet === null ? null : Number.parseFloat(row.min_bet),
    maxBet: row.max_bet === null ? null : Number.parseFloat(row.max_bet),
    maxWin: row.max_win === null ? null : Number.parseFloat(row.max_win),
  };
}

// Only exposes the fields the Bets section's "Bet Limits" tab needs
// (list + per-game min/max bet and max win). Full CMS CRUD over the games
// catalog - create/delete/thumbnail/rename/etc, CLAUDE.md phase 7 - is a
// separate, not-yet-built phase; this deliberately doesn't grow into that.
export class GameLimitsService {
  constructor(private readonly db: Kysely<Database>) {}

  async list(filter: GameListFilter) {
    let query = this.db.selectFrom('games').select(['id', 'name', 'category', 'provider', 'is_active', 'min_bet', 'max_bet', 'max_win']);
    if (filter.category) query = query.where('category', '=', filter.category);
    const rows = await query.orderBy('name', 'asc').execute();
    return rows.map(toApiShape);
  }

  async updateLimits(id: string, input: UpdateGameLimitsInput) {
    const existing = await this.db.selectFrom('games').select('id').where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Game ${id} not found`);

    await this.db
      .updateTable('games')
      .set({
        min_bet: input.minBet !== undefined ? String(input.minBet) : undefined,
        max_bet: input.maxBet !== undefined ? String(input.maxBet) : undefined,
        max_win: input.maxWin !== undefined ? String(input.maxWin) : undefined,
      })
      .where('id', '=', id)
      .execute();

    const row = await this.db
      .selectFrom('games')
      .select(['id', 'name', 'category', 'provider', 'is_active', 'min_bet', 'max_bet', 'max_win'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
    return toApiShape(row);
  }
}
