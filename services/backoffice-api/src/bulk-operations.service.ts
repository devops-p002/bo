import { ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';
import type { PlayerStatus, PlayerVipLevel } from './db/schema.js';

const BulkOperationId = defineId('BulkOperationId');

const STATUS_VALUES: PlayerStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING'];
const VIP_VALUES: PlayerVipLevel[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];

export interface CreateBulkOperationInput {
  operationType: 'STATUS_CHANGE' | 'VIP_LEVEL_UPDATE' | 'BALANCE_ADJUSTMENT';
  playerIds: string[];
  value: string;
  createdBy: string;
}

export class BulkOperationsService {
  constructor(private readonly db: Kysely<Database>) {}

  async list() {
    const rows = await this.db.selectFrom('bulk_operations').selectAll().orderBy('created_at', 'desc').execute();
    return rows.map((row) => ({
      id: row.id,
      operationType: row.operation_type,
      value: row.value,
      affectedCount: row.affected_count,
      status: row.status,
      errorMessage: row.error_message,
      createdBy: row.created_by,
      createdAt: row.created_at.toISOString(),
      completedAt: row.completed_at ? row.completed_at.toISOString() : null,
    }));
  }

  async create(input: CreateBulkOperationInput) {
    if (input.playerIds.length === 0) {
      throw new ValidationError('At least one player must be selected');
    }
    if (input.operationType === 'STATUS_CHANGE' && !STATUS_VALUES.includes(input.value as PlayerStatus)) {
      throw new ValidationError(`Invalid status value "${input.value}"`);
    }
    if (input.operationType === 'VIP_LEVEL_UPDATE' && !VIP_VALUES.includes(input.value as PlayerVipLevel)) {
      throw new ValidationError(`Invalid VIP level value "${input.value}"`);
    }
    if (input.operationType === 'BALANCE_ADJUSTMENT' && Number.isNaN(Number.parseFloat(input.value))) {
      throw new ValidationError(`Invalid balance adjustment amount "${input.value}"`);
    }

    const id = BulkOperationId.generate();

    try {
      const affectedCount = await this.db.transaction().execute(async (trx) => {
        let updateResult;
        if (input.operationType === 'STATUS_CHANGE') {
          updateResult = await trx.updateTable('players').set({ status: input.value as PlayerStatus }).where('id', 'in', input.playerIds).executeTakeFirst();
        } else if (input.operationType === 'VIP_LEVEL_UPDATE') {
          updateResult = await trx.updateTable('players').set({ vip_level: input.value as PlayerVipLevel }).where('id', 'in', input.playerIds).executeTakeFirst();
        } else {
          const amount = Number.parseFloat(input.value);
          updateResult = await trx
            .updateTable('players')
            .set((eb) => ({ balance: eb('balance', '+', String(amount)) }))
            .where('id', 'in', input.playerIds)
            .executeTakeFirst();
        }
        return Number(updateResult.numUpdatedRows ?? 0);
      });

      await this.db
        .insertInto('bulk_operations')
        .values({
          id,
          operation_type: input.operationType,
          value: input.value,
          affected_count: affectedCount,
          status: 'COMPLETED',
          created_by: input.createdBy,
          completed_at: new Date(),
        })
        .execute();
    } catch (err) {
      await this.db
        .insertInto('bulk_operations')
        .values({
          id,
          operation_type: input.operationType,
          value: input.value,
          affected_count: 0,
          status: 'FAILED',
          error_message: err instanceof Error ? err.message : 'Unknown error',
          created_by: input.createdBy,
          completed_at: new Date(),
        })
        .execute();
      throw err;
    }

    return { id };
  }
}
