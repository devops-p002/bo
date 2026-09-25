import { ConflictError, NotFoundError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database, KycDocumentType, KycStatus } from './db/schema.js';

const KycVerificationId = defineId('KycVerificationId');

export interface SubmitKycInput {
  documentType: KycDocumentType;
  documentNumber: string;
  expiryDate: string;
  frontImagePath: string;
  backImagePath: string;
  selfieImagePath: string;
}

function toStatusShape(row: {
  id: string;
  document_type: KycDocumentType;
  status: KycStatus;
  rejection_reason: string | null;
  reviewed_at: Date | null;
  created_at: Date;
}) {
  return {
    id: row.id,
    documentType: row.document_type,
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

/** Player-facing half of the KYC flow (POST /kyc/verification, GET
 * /kyc/verification/me) - see services/backoffice-api's KycService for
 * the admin review half that actually decides status. player_api_app has
 * no UPDATE grant on kyc_verifications at all, so a player can submit
 * and read their own history but never self-approve or silently
 * overwrite a row an admin already decided - enforced at the database
 * level, not just here (same pattern as WalletService.requestTransaction's
 * own comment). */
export class KycService {
  constructor(private readonly db: Kysely<Database>) {}

  async getLatest(playerId: string) {
    const row = await this.db
      .selectFrom('kyc_verifications')
      .select(['id', 'document_type', 'status', 'rejection_reason', 'reviewed_at', 'created_at'])
      .where('player_id', '=', playerId)
      .orderBy('created_at', 'desc')
      .executeTakeFirst();
    return row ? toStatusShape(row) : null;
  }

  async getImagePath(playerId: string, id: string, which: 'front' | 'back' | 'selfie'): Promise<string> {
    const column = which === 'front' ? 'front_image_path' : which === 'back' ? 'back_image_path' : 'selfie_image_path';
    const row = await this.db.selectFrom('kyc_verifications').select(column).where('id', '=', id).where('player_id', '=', playerId).executeTakeFirst();
    if (!row) throw new NotFoundError(`KYC verification ${id} not found`);
    return row[column];
  }

  // Blocks a second submission while one is PENDING or already APPROVED
  // (no duplicate-submission spam, no re-approving what's already
  // decided) - a REJECTED player is free to submit again with corrected
  // info, which is the only path back into PENDING.
  async submit(playerId: string, input: SubmitKycInput) {
    const existing = await this.getLatest(playerId);
    if (existing && existing.status !== 'REJECTED') {
      throw new ConflictError(`KYC verification already ${existing.status.toLowerCase()}`);
    }

    const id = KycVerificationId.generate();
    await this.db
      .insertInto('kyc_verifications')
      .values({
        id,
        player_id: playerId,
        document_type: input.documentType,
        document_number: input.documentNumber,
        expiry_date: input.expiryDate,
        front_image_path: input.frontImagePath,
        back_image_path: input.backImagePath,
        selfie_image_path: input.selfieImagePath,
      })
      .execute();

    const row = await this.db
      .selectFrom('kyc_verifications')
      .select(['id', 'document_type', 'status', 'rejection_reason', 'reviewed_at', 'created_at'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();
    return toStatusShape(row);
  }
}
