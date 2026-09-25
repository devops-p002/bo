import { NotFoundError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, TransactionStatus, TransactionType } from './db/schema.js';

const TransactionId = defineId('TransactionId');

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function toPlayerShape(row: {
  id: string;
  username: string | null;
  email: string;
  currency: string;
  status: string;
  vip_level: string;
  balance: string;
  bonus_balance: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: Date | null;
  country: string | null;
  created_at: Date;
}) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    currency: row.currency,
    status: row.status,
    vipLevel: row.vip_level,
    balance: toNumber(row.balance),
    bonusBalance: toNumber(row.bonus_balance),
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().slice(0, 10) : null,
    country: row.country,
    createdAt: row.created_at.toISOString(),
  };
}

function toTransactionShape(row: {
  id: string;
  type: TransactionType;
  amount: string;
  currency: string;
  status: TransactionStatus;
  payment_method: string | null;
  external_reference: string | null;
  reason: string | null;
  created_at: Date;
}) {
  return {
    id: row.id,
    type: row.type,
    amount: toNumber(row.amount),
    currency: row.currency,
    status: row.status,
    paymentMethod: row.payment_method,
    externalReference: row.external_reference,
    reason: row.reason,
    createdAt: row.created_at.toISOString(),
  };
}

export interface RequestTransactionInput {
  amount: number;
  currency?: string | undefined;
  paymentMethod?: string | undefined;
}

export interface UpdateProfileInput {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  dateOfBirth?: string | undefined;
  country?: string | undefined;
}

const PLAYER_SHAPE_COLUMNS = [
  'id',
  'username',
  'email',
  'currency',
  'status',
  'vip_level',
  'balance',
  'bonus_balance',
  'first_name',
  'last_name',
  'phone',
  'date_of_birth',
  'country',
  'created_at',
] as const;

export class WalletService {
  constructor(private readonly db: Kysely<Database>) {}

  async getWallet(playerId: string) {
    const row = await this.db.selectFrom('players').select(PLAYER_SHAPE_COLUMNS).where('id', '=', playerId).executeTakeFirst();
    if (!row) throw new NotFoundError(`Player ${playerId} not found`);
    return toPlayerShape(row);
  }

  // Registration is deliberately light (email+username+password only -
  // see registerSchema) - this is how a player fills in the rest, on
  // their own "Complete your profile" page, whenever they choose to.
  async updateProfile(playerId: string, input: UpdateProfileInput) {
    await this.db
      .updateTable('players')
      .set({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        date_of_birth: input.dateOfBirth,
        country: input.country,
      })
      .where('id', '=', playerId)
      .execute();
    return this.getWallet(playerId);
  }

  // Deposits and withdrawals both start PENDING - neither touches
  // balance here. Only backoffice-api's admin-facing approval flow ever
  // credits/debits balance (see its TransactionsService.updateStatus) -
  // player-api's own DB role has no UPDATE grant on this table at all,
  // so that boundary is enforced at the database level too, not just in
  // application code.
  async requestTransaction(playerId: string, type: 'DEPOSIT' | 'WITHDRAWAL', input: RequestTransactionInput) {
    const id = TransactionId.generate();
    await this.db
      .insertInto('transactions')
      .values({
        id,
        player_id: playerId,
        type,
        amount: String(input.amount),
        currency: input.currency ?? 'USD',
        payment_method: input.paymentMethod ?? null,
      })
      .execute();

    const row = await this.db
      .selectFrom('transactions')
      .select(['id', 'type', 'amount', 'currency', 'status', 'payment_method', 'external_reference', 'reason', 'created_at'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
    return toTransactionShape(row);
  }

  async listTransactions(playerId: string, pagination: { page: number; limit: number }) {
    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await this.db
      .selectFrom('transactions')
      .select(['id', 'type', 'amount', 'currency', 'status', 'payment_method', 'external_reference', 'reason', 'created_at'])
      .where('player_id', '=', playerId)
      .orderBy('created_at', 'desc')
      .limit(pagination.limit)
      .offset(offset)
      .execute();
    return rows.map(toTransactionShape);
  }
}
