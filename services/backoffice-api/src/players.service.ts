import { NotFoundError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, PlayerStatus, PlayerVipLevel } from './db/schema.js';

const PlayerId = defineId('PlayerId');

export interface PlayerListFilter {
  search?: string | undefined;
  fullName?: string | undefined;
  phone?: string | undefined;
  status?: PlayerStatus | undefined;
  vipLevel?: PlayerVipLevel | undefined;
  dateRange?: { start: string; end: string } | undefined;
  lastLoginIP?: string | undefined;
  lastLoginSince?: string | undefined;
  noLoginSince?: string | undefined;
}

export interface PlayerListPagination {
  page: number;
  limit: number;
}

export interface CreatePlayerInput {
  username?: string | undefined;
  email: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  dateOfBirth?: string | undefined;
  country?: string | undefined;
  currency?: string | undefined;
  vipLevel?: PlayerVipLevel | undefined;
}

export interface UpdatePlayerInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  dateOfBirth?: string | undefined;
  vipLevel?: PlayerVipLevel | undefined;
  status?: PlayerStatus | undefined;
  phone?: string | undefined;
  email?: string | undefined;
}

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

// Matches the shape apps/backoffice-web's Members pages already expect
// (see useMemberSearch.ts's SEARCH_MEMBERS query / MemberProfile.tsx's
// GET_MEMBER_PROFILE query, both documented against the real fields the
// UI renders) - fullName is derived here since the UI reads it directly
// rather than composing first/last itself.
function toApiShape(row: {
  id: string;
  username: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: Date | null;
  country: string | null;
  currency: string;
  status: PlayerStatus;
  vip_level: PlayerVipLevel;
  balance: string;
  bonus_balance: string;
  total_deposits: string;
  total_withdrawals: string;
  total_bets: string;
  total_wins: string;
  last_login_at: Date | null;
  last_login_ip: string | null;
  last_login_country: string | null;
  last_login_user_agent: string | null;
  last_login_device: string | null;
  created_at: Date;
}) {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username || row.email;
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName,
    phone: row.phone,
    dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString() : null,
    country: row.country,
    currency: row.currency,
    status: row.status,
    vipLevel: row.vip_level,
    balance: toNumber(row.balance),
    bonusBalance: toNumber(row.bonus_balance),
    totalDeposits: toNumber(row.total_deposits),
    totalWithdrawals: toNumber(row.total_withdrawals),
    totalBets: toNumber(row.total_bets),
    totalWins: toNumber(row.total_wins),
    lastLoginAt: row.last_login_at ? row.last_login_at.toISOString() : null,
    lastLoginIP: row.last_login_ip,
    lastLoginCountry: row.last_login_country,
    lastLoginUserAgent: row.last_login_user_agent,
    lastLoginDevice: row.last_login_device,
    createdAt: row.created_at.toISOString(),
  };
}

export class PlayersService {
  constructor(private readonly db: Kysely<Database>) {}

  async list(filter: PlayerListFilter, pagination: PlayerListPagination) {
    let query = this.db.selectFrom('players').selectAll();
    let countQuery = this.db.selectFrom('players');

    if (filter.search) {
      const term = `%${filter.search}%`;
      query = query.where((eb) => eb.or([eb('username', 'ilike', term), eb('email', 'ilike', term)]));
      countQuery = countQuery.where((eb) => eb.or([eb('username', 'ilike', term), eb('email', 'ilike', term)]));
    }
    if (filter.fullName) {
      const term = `%${filter.fullName}%`;
      query = query.where((eb) => eb.or([eb('first_name', 'ilike', term), eb('last_name', 'ilike', term)]));
      countQuery = countQuery.where((eb) => eb.or([eb('first_name', 'ilike', term), eb('last_name', 'ilike', term)]));
    }
    if (filter.phone) {
      const term = `%${filter.phone}%`;
      query = query.where('phone', 'ilike', term);
      countQuery = countQuery.where('phone', 'ilike', term);
    }
    if (filter.status) {
      query = query.where('status', '=', filter.status);
      countQuery = countQuery.where('status', '=', filter.status);
    }
    if (filter.vipLevel) {
      query = query.where('vip_level', '=', filter.vipLevel);
      countQuery = countQuery.where('vip_level', '=', filter.vipLevel);
    }
    if (filter.dateRange) {
      query = query.where('created_at', '>=', new Date(filter.dateRange.start)).where('created_at', '<=', new Date(filter.dateRange.end));
      countQuery = countQuery.where('created_at', '>=', new Date(filter.dateRange.start)).where('created_at', '<=', new Date(filter.dateRange.end));
    }
    if (filter.lastLoginIP) {
      const term = `%${filter.lastLoginIP}%`;
      query = query.where('last_login_ip', 'ilike', term);
      countQuery = countQuery.where('last_login_ip', 'ilike', term);
    }
    if (filter.lastLoginSince) {
      const since = new Date(filter.lastLoginSince);
      query = query.where('last_login_at', '>=', since);
      countQuery = countQuery.where('last_login_at', '>=', since);
    }
    if (filter.noLoginSince) {
      // "No Login Since <date>" means the player hasn't logged in since
      // that date - last_login_at is at or before it, or they've never
      // logged in at all (null).
      const since = new Date(filter.noLoginSince);
      query = query.where((eb) => eb.or([eb('last_login_at', 'is', null), eb('last_login_at', '<=', since)]));
      countQuery = countQuery.where((eb) => eb.or([eb('last_login_at', 'is', null), eb('last_login_at', '<=', since)]));
    }

    const totalRow = await countQuery.select((eb) => eb.fn.countAll<string>().as('count')).executeTakeFirstOrThrow();
    const totalCount = Number.parseInt(totalRow.count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await query.orderBy('created_at', 'desc').limit(pagination.limit).offset(offset).execute();

    return { totalCount, nodes: rows.map(toApiShape) };
  }

  async getById(id: string) {
    const row = await this.db.selectFrom('players').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`Player ${id} not found`);

    const player = toApiShape(row);
    const txCountRow = await this.db
      .selectFrom('transactions')
      .select((eb) => eb.fn.countAll<string>().as('count'))
      .where('player_id', '=', id)
      .executeTakeFirst();
    const totalTransactions = txCountRow ? Number.parseInt(txCountRow.count, 10) : 0;
    const profitLoss = player.totalWins - player.totalBets;
    const winRate = player.totalBets > 0 ? (player.totalWins / player.totalBets) * 100 : 0;
    const averageBetAmount = 0;
    const riskScore = 0;

    return {
      ...player,
      statistics: { totalTransactions, profitLoss, winRate, averageBetAmount, riskScore },
    };
  }

  async create(input: CreatePlayerInput) {
    const id = PlayerId.generate();
    await this.db
      .insertInto('players')
      .values({
        id,
        username: input.username ?? null,
        email: input.email.toLowerCase(),
        first_name: input.firstName ?? null,
        last_name: input.lastName ?? null,
        phone: input.phone ?? null,
        date_of_birth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        country: input.country ?? null,
        currency: input.currency ?? 'USD',
        vip_level: input.vipLevel ?? 'BRONZE',
      })
      .execute();
    return this.getById(id);
  }

  async update(id: string, input: UpdatePlayerInput) {
    const existing = await this.db.selectFrom('players').select('id').where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Player ${id} not found`);

    const values: Record<string, unknown> = {};
    if (input.firstName !== undefined) values.first_name = input.firstName;
    if (input.lastName !== undefined) values.last_name = input.lastName;
    if (input.dateOfBirth !== undefined) values.date_of_birth = new Date(input.dateOfBirth);
    if (input.vipLevel !== undefined) values.vip_level = input.vipLevel;
    if (input.status !== undefined) values.status = input.status;
    if (input.phone !== undefined) values.phone = input.phone;
    if (input.email !== undefined) values.email = input.email.toLowerCase();

    if (Object.keys(values).length > 0) {
      await this.db.updateTable('players').set(values).where('id', '=', id).execute();
    }
    return this.getById(id);
  }

  // The actual fraud/multi-account value of player_devices: given a
  // player, find every OTHER player who has ever logged in from any of
  // the same device fingerprints. Two-step (not one join) because a
  // player can have several devices and each device can be shared with
  // several other players - collecting distinct fingerprints first keeps
  // the second query a simple IN rather than a self-join that would
  // double-count a pair sharing more than one device.
  async getLinkedAccounts(id: string) {
    const ownDevices = await this.db.selectFrom('player_devices').select('fingerprint').where('player_id', '=', id).execute();
    const fingerprints = [...new Set(ownDevices.map((d) => d.fingerprint))];
    if (fingerprints.length === 0) return [];

    const rows = await this.db
      .selectFrom('player_devices')
      .innerJoin('players', 'players.id', 'player_devices.player_id')
      .select([
        'players.id as playerId',
        'players.username as username',
        'players.email as email',
        'players.status as status',
        'player_devices.fingerprint as fingerprint',
        'player_devices.last_seen_at as lastSeenAt',
      ])
      .where('player_devices.fingerprint', 'in', fingerprints)
      .where('player_devices.player_id', '!=', id)
      .orderBy('player_devices.last_seen_at', 'desc')
      .execute();

    // Collapse to one row per linked player (they may share more than one
    // fingerprint with the looked-up player) - keep the most recent
    // shared-device sighting, which the ORDER BY above already puts first.
    const byPlayer = new Map<string, { playerId: string; username: string | null; email: string; status: PlayerStatus; sharedFingerprints: number; lastSeenAt: string }>();
    for (const row of rows) {
      const existing = byPlayer.get(row.playerId);
      if (existing) {
        existing.sharedFingerprints += 1;
      } else {
        byPlayer.set(row.playerId, {
          playerId: row.playerId,
          username: row.username,
          email: row.email,
          status: row.status,
          sharedFingerprints: 1,
          lastSeenAt: row.lastSeenAt.toISOString(),
        });
      }
    }
    return [...byPlayer.values()];
  }
}
