import { NotFoundError, ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, TransactionStatus, TransactionType } from './db/schema.js';

const TransactionId = defineId('TransactionId');

export interface TransactionListFilter {
  type?: TransactionType | undefined;
  status?: TransactionStatus | undefined;
  paymentMethod?: string | undefined;
  currency?: string | undefined;
  playerId?: string | undefined;
  search?: string | undefined;
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  dateRange?: { start: string; end: string } | undefined;
}

export interface TransactionListPagination {
  page: number;
  limit: number;
}

export interface CreateTransactionInput {
  playerId: string;
  type: TransactionType;
  amount: number;
  currency?: string | undefined;
  paymentMethod?: string | undefined;
  externalReference?: string | undefined;
}

export interface UpdateTransactionStatusInput {
  status: TransactionStatus;
  reason?: string | undefined;
}

function toApiShape(row: {
  id: string;
  player_id: string;
  username: string | null;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  payment_method: string | null;
  external_reference: string | null;
  reason: string | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: row.id,
    playerId: row.player_id,
    username: row.username,
    type: row.type,
    amount: Number.parseFloat(row.amount),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    externalReference: row.external_reference,
    reason: row.reason,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class TransactionsService {
  constructor(private readonly db: Kysely<Database>) {}

  private baseQuery() {
    return this.db
      .selectFrom('transactions')
      .innerJoin('players', 'players.id', 'transactions.player_id')
      .select([
        'transactions.id as id',
        'transactions.player_id as player_id',
        'players.username as username',
        'transactions.type as type',
        'transactions.amount as amount',
        'transactions.currency as currency',
        'transactions.status as status',
        'transactions.payment_method as payment_method',
        'transactions.external_reference as external_reference',
        'transactions.reason as reason',
        'transactions.created_at as created_at',
        'transactions.updated_at as updated_at',
      ]);
  }

  private applyFilter<Q extends { where: any }>(query: Q, filter: TransactionListFilter): Q {
    let q = query;
    if (filter.type) q = q.where('transactions.type', '=', filter.type);
    if (filter.status) q = q.where('transactions.status', '=', filter.status);
    if (filter.paymentMethod) q = q.where('transactions.payment_method', '=', filter.paymentMethod);
    if (filter.currency) q = q.where('transactions.currency', '=', filter.currency);
    if (filter.playerId) q = q.where('transactions.player_id', '=', filter.playerId);
    if (filter.minAmount !== undefined) q = q.where('transactions.amount', '>=', String(filter.minAmount));
    if (filter.maxAmount !== undefined) q = q.where('transactions.amount', '<=', String(filter.maxAmount));
    if (filter.dateRange) {
      q = q.where('transactions.created_at', '>=', new Date(filter.dateRange.start)).where('transactions.created_at', '<=', new Date(filter.dateRange.end));
    }
    if (filter.search) {
      const term = `%${filter.search}%`;
      q = q.where((eb: any) => eb.or([eb('players.username', 'ilike', term), eb('transactions.external_reference', 'ilike', term), eb('transactions.id', 'ilike', term)]));
    }
    return q;
  }

  async list(filter: TransactionListFilter, pagination: TransactionListPagination) {
    const query = this.applyFilter(this.baseQuery(), filter);
    const countQuery = this.applyFilter(this.db.selectFrom('transactions').innerJoin('players', 'players.id', 'transactions.player_id'), filter);

    const totalRow = await countQuery.select((eb) => eb.fn.countAll<string>().as('count')).executeTakeFirstOrThrow();
    const totalCount = Number.parseInt(totalRow.count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await query.orderBy('transactions.created_at', 'desc').limit(pagination.limit).offset(offset).execute();

    return { totalCount, nodes: rows.map(toApiShape) };
  }

  async getById(id: string) {
    const row = await this.baseQuery().where('transactions.id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`Transaction ${id} not found`);
    return toApiShape(row);
  }

  async create(input: CreateTransactionInput) {
    const player = await this.db.selectFrom('players').select('id').where('id', '=', input.playerId).executeTakeFirst();
    if (!player) throw new NotFoundError(`Player ${input.playerId} not found`);

    const id = TransactionId.generate();
    await this.db
      .insertInto('transactions')
      .values({
        id,
        player_id: input.playerId,
        type: input.type,
        amount: String(input.amount),
        currency: input.currency ?? 'USD',
        payment_method: input.paymentMethod ?? null,
        external_reference: input.externalReference ?? null,
      })
      .execute();
    return this.getById(id);
  }

  // Balance only ever moves on a transition INTO COMPLETED (never on the
  // reverse - there's no un-completing a transaction here), and only
  // once: re-approving an already-COMPLETED row is a no-op on balance,
  // not a double-credit. A withdrawal that would take balance negative
  // is rejected rather than silently allowed - admin trust elsewhere in
  // this service doesn't extend to letting a click overdraw an account.
  async updateStatus(id: string, input: UpdateTransactionStatusInput) {
    await this.db.transaction().execute(async (trx) => {
      const existing = await trx.selectFrom('transactions').selectAll().where('id', '=', id).forUpdate().executeTakeFirst();
      if (!existing) throw new NotFoundError(`Transaction ${id} not found`);

      const isNewlyCompleted = input.status === 'COMPLETED' && existing.status !== 'COMPLETED';
      if (isNewlyCompleted) {
        const amount = Number.parseFloat(existing.amount);
        const delta = existing.type === 'WITHDRAWAL' ? -amount : amount;

        if (delta < 0) {
          const player = await trx.selectFrom('players').select('balance').where('id', '=', existing.player_id).executeTakeFirstOrThrow();
          if (Number.parseFloat(player.balance) + delta < 0) {
            throw new ValidationError('Player balance is insufficient to complete this withdrawal');
          }
        }

        await trx.updateTable('players').set((eb) => ({ balance: eb('balance', '+', String(delta)) })).where('id', '=', existing.player_id).execute();
      }

      await trx
        .updateTable('transactions')
        .set({ status: input.status, reason: input.reason ?? null, updated_at: new Date() })
        .where('id', '=', id)
        .execute();
    });

    return this.getById(id);
  }
}
