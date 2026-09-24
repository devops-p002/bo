import { defineId } from '@platform/ids';
import { NotFoundError } from '@platform/errors';
import type { Kysely } from 'kysely';
import type { CaseQueueItemsTable, Database } from './db/schema.js';

const CaseQueueItemId = defineId('CaseQueueItemId');

export type QueueType = CaseQueueItemsTable['queue_type'];

export class CaseQueueService {
  constructor(private readonly db: Kysely<Database>) {}

  async createItem(queueType: QueueType, referenceId: string): Promise<{ id: string }> {
    const id = CaseQueueItemId.generate();
    await this.db.insertInto('case_queue_items').values({ id, queue_type: queueType, reference_id: referenceId, status: 'open' }).execute();
    return { id };
  }

  async list(queueType?: QueueType) {
    let query = this.db.selectFrom('case_queue_items').selectAll().orderBy('created_at', 'desc');
    if (queueType) query = query.where('queue_type', '=', queueType);
    return query.execute();
  }

  /** Resolves the open item(s) referencing a given entity - used to
   * auto-close a maker-checker request's case item the moment it's
   * decided, without the caller needing to know the case item's own
   * id. */
  async resolveByReference(referenceId: string, resolvedBy: string): Promise<void> {
    await this.db
      .updateTable('case_queue_items')
      .set({ status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date() })
      .where('reference_id', '=', referenceId)
      .where('status', '=', 'open')
      .execute();
  }

  async resolve(id: string, resolvedBy: string, notes?: string) {
    const existing = await this.db.selectFrom('case_queue_items').selectAll().where('id', '=', id).executeTakeFirst();
    if (!existing) throw new NotFoundError(`Unknown case queue item ${id}`);

    await this.db
      .updateTable('case_queue_items')
      .set({ status: 'resolved', resolved_by: resolvedBy, resolved_at: new Date(), notes: notes ?? existing.notes })
      .where('id', '=', id)
      .execute();

    return this.db.selectFrom('case_queue_items').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
  }
}
