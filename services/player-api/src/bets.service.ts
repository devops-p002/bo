import type { Kysely } from 'kysely';
import type { BetStatus, Database } from './db/schema.js';

function toApiShape(row: {
  id: string;
  game_id: string;
  game_name: string | null;
  type: string;
  status: BetStatus;
  amount: string;
  currency: string;
  odds: string | null;
  potential_win: string;
  win_amount: string | null;
  created_at: Date;
  settled_at: Date | null;
}) {
  return {
    id: row.id,
    gameId: row.game_id,
    gameName: row.game_name,
    type: row.type,
    status: row.status,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    odds: row.odds === null ? null : Number.parseFloat(row.odds),
    potentialWin: Number.parseFloat(row.potential_win),
    winAmount: row.win_amount === null ? null : Number.parseFloat(row.win_amount),
    createdAt: row.created_at.toISOString(),
    settledAt: row.settled_at === null ? null : row.settled_at.toISOString(),
  };
}

// Read-only, own rows only - see the grant-player-bets-select migration.
// Table starts empty until a real game engine places bets (see the
// create-bets migration's comment); an empty list here is the honest,
// expected state, not a bug.
export class BetsService {
  constructor(private readonly db: Kysely<Database>) {}

  async listMyBets(playerId: string) {
    const rows = await this.db
      .selectFrom('bets')
      .leftJoin('games', 'games.id', 'bets.game_id')
      .select([
        'bets.id',
        'bets.game_id',
        'games.name as game_name',
        'bets.type',
        'bets.status',
        'bets.amount',
        'bets.currency',
        'bets.odds',
        'bets.potential_win',
        'bets.win_amount',
        'bets.created_at',
        'bets.settled_at',
      ])
      .where('bets.player_id', '=', playerId)
      .orderBy('bets.created_at', 'desc')
      .execute();
    return rows.map(toApiShape);
  }
}
