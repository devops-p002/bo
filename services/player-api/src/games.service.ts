import type { Kysely } from 'kysely';
import type { Database, GameCategory } from './db/schema.js';

function toApiShape(row: { id: string; name: string; category: GameCategory; provider: string; thumbnail_url: string | null }) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    provider: row.provider,
    thumbnailUrl: row.thumbnail_url,
  };
}

export class GamesService {
  constructor(private readonly db: Kysely<Database>) {}

  async list(category?: GameCategory) {
    let query = this.db
      .selectFrom('games')
      .select(['id', 'name', 'category', 'provider', 'thumbnail_url'])
      .where('is_active', '=', true);
    if (category) query = query.where('category', '=', category);
    const rows = await query.orderBy('name', 'asc').execute();
    return rows.map(toApiShape);
  }
}
