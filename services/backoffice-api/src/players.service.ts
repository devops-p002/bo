import { NotFoundError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, PlayerStatus, PlayerVipLevel } from './db/schema.js';

const PlayerId = defineId('PlayerId');

export interface PlayerListFilter {
  search?: string | undefined;
  status?: PlayerStatus | undefined;
  vipLevel?: PlayerVipLevel | undefined;
  dateRange?: { start: string; end: string } | undefined;
}

export interface PlayerListPagination {
  page: number;
  limit: number;
}

export interface CreatePlayerInput {
  username: string;
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
  username: string;
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
  created_at: Date;
}) {
  const fullName = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.username;
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
    // Derived, not stored - computed fresh from the same totals the
    // profile already displays, rather than a separate transactions
    // table this pass doesn't build (see the migration's own comment on
    // why balance/totals are plain tracking columns, not a ledger).
    const totalTransactions = 0;
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
        username: input.username,
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
}
