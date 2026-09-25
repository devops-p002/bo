import { NotFoundError, ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, KycDocumentType, KycStatus } from './db/schema.js';

const NotificationId = defineId('PlayerNotificationId');

export interface KycListFilter {
  status?: KycStatus | undefined;
  playerId?: string | undefined;
  search?: string | undefined;
}

export interface KycListPagination {
  page: number;
  limit: number;
}

export interface UpdateKycStatusInput {
  status: 'APPROVED' | 'REJECTED';
  reviewedBy: string;
  rejectionReason?: string | undefined;
}

function toApiShape(row: {
  id: string;
  player_id: string;
  username: string | null;
  email: string | null;
  document_type: KycDocumentType;
  document_number: string;
  expiry_date: Date;
  status: KycStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: row.id,
    playerId: row.player_id,
    username: row.username,
    email: row.email,
    documentType: row.document_type,
    documentNumber: row.document_number,
    expiryDate: row.expiry_date.toISOString().slice(0, 10),
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/** Admin review side of the KYC flow - see services/player-api's
 * KycService for the player-facing submission half. Mirrors
 * TransactionsService's shape: players create PENDING rows through
 * their own least-privilege DB role, only this service (running as
 * backoffice_api_app, the only role with UPDATE on kyc_verifications)
 * ever changes status. */
export class KycService {
  constructor(private readonly db: Kysely<Database>) {}

  private baseQuery() {
    return this.db
      .selectFrom('kyc_verifications')
      .innerJoin('players', 'players.id', 'kyc_verifications.player_id')
      .select([
        'kyc_verifications.id as id',
        'kyc_verifications.player_id as player_id',
        'players.username as username',
        'players.email as email',
        'kyc_verifications.document_type as document_type',
        'kyc_verifications.document_number as document_number',
        'kyc_verifications.expiry_date as expiry_date',
        'kyc_verifications.status as status',
        'kyc_verifications.rejection_reason as rejection_reason',
        'kyc_verifications.reviewed_by as reviewed_by',
        'kyc_verifications.reviewed_at as reviewed_at',
        'kyc_verifications.created_at as created_at',
        'kyc_verifications.updated_at as updated_at',
      ]);
  }

  private applyFilter<Q extends { where: any }>(query: Q, filter: KycListFilter): Q {
    let q = query;
    if (filter.status) q = q.where('kyc_verifications.status', '=', filter.status);
    if (filter.playerId) q = q.where('kyc_verifications.player_id', '=', filter.playerId);
    if (filter.search) {
      const term = `%${filter.search}%`;
      q = q.where((eb: any) => eb.or([eb('players.username', 'ilike', term), eb('players.email', 'ilike', term), eb('kyc_verifications.document_number', 'ilike', term)]));
    }
    return q;
  }

  async list(filter: KycListFilter, pagination: KycListPagination) {
    const query = this.applyFilter(this.baseQuery(), filter);
    const countQuery = this.applyFilter(this.db.selectFrom('kyc_verifications').innerJoin('players', 'players.id', 'kyc_verifications.player_id'), filter);

    const totalRow = await countQuery.select((eb) => eb.fn.countAll<string>().as('count')).executeTakeFirstOrThrow();
    const totalCount = Number.parseInt(totalRow.count, 10);

    const offset = (pagination.page - 1) * pagination.limit;
    const rows = await query.orderBy('kyc_verifications.created_at', 'desc').limit(pagination.limit).offset(offset).execute();

    return { totalCount, nodes: rows.map(toApiShape) };
  }

  async getById(id: string) {
    const row = await this.baseQuery().where('kyc_verifications.id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`KYC verification ${id} not found`);
    return toApiShape(row);
  }

  async getImagePath(id: string, which: 'front' | 'back' | 'selfie'): Promise<string> {
    const column = which === 'front' ? 'front_image_path' : which === 'back' ? 'back_image_path' : 'selfie_image_path';
    const row = await this.db.selectFrom('kyc_verifications').select(column).where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`KYC verification ${id} not found`);
    return row[column];
  }

  // A decision is final: an already-APPROVED/REJECTED row can't be
  // silently re-decided (mirrors TransactionsService's "no un-completing
  // a transaction" boundary) - a rejected player instead submits a fresh
  // row (see player-api's KycService.submit, which allows a new PENDING
  // row once the latest one is REJECTED).
  async updateStatus(id: string, input: UpdateKycStatusInput) {
    if (input.status === 'REJECTED' && !input.rejectionReason?.trim()) {
      throw new ValidationError('rejectionReason is required when rejecting a KYC submission');
    }

    await this.db.transaction().execute(async (trx) => {
      const existing = await trx.selectFrom('kyc_verifications').select(['status', 'player_id']).where('id', '=', id).forUpdate().executeTakeFirst();
      if (!existing) throw new NotFoundError(`KYC verification ${id} not found`);
      if (existing.status !== 'PENDING') {
        throw new ValidationError(`KYC verification ${id} was already ${existing.status.toLowerCase()}`);
      }

      await trx
        .updateTable('kyc_verifications')
        .set({
          status: input.status,
          rejection_reason: input.status === 'REJECTED' ? input.rejectionReason!.trim() : null,
          reviewed_by: input.reviewedBy,
          reviewed_at: new Date(),
          updated_at: new Date(),
        })
        .where('id', '=', id)
        .execute();

      if (input.status === 'REJECTED') {
        await trx
          .insertInto('player_notifications')
          .values({
            id: NotificationId.generate(),
            player_id: existing.player_id,
            type: 'KYC_REJECTED',
            title: 'Verification rejected',
            body: `Your identity verification was rejected: ${input.rejectionReason!.trim()}`,
          })
          .execute();
      }
    });

    return this.getById(id);
  }
}
