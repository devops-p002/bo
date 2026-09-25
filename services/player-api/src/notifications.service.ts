import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';

function toApiShape(row: { id: string; type: string; title: string; body: string; created_at: Date; read_at: Date | null }) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at.toISOString(),
    readAt: row.read_at ? row.read_at.toISOString() : null,
  };
}

/** Narrow, single-purpose notification list - see the create-player-
 * notifications migration's comment. Nothing in this service inserts a
 * row; only backoffice-api's KycService does, on a rejection. */
export class NotificationsService {
  constructor(private readonly db: Kysely<Database>) {}

  async list(playerId: string) {
    const rows = await this.db
      .selectFrom('player_notifications')
      .select(['id', 'type', 'title', 'body', 'created_at', 'read_at'])
      .where('player_id', '=', playerId)
      .orderBy('created_at', 'desc')
      .execute();
    return rows.map(toApiShape);
  }

  async markRead(playerId: string, id: string): Promise<void> {
    await this.db
      .updateTable('player_notifications')
      .set({ read_at: new Date() })
      .where('id', '=', id)
      .where('player_id', '=', playerId)
      .execute();
  }
}
