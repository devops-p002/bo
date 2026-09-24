import { defineId } from '@platform/ids';
import { type AuditEventInput, type AuditRecord, GENESIS_HASH, buildRecord } from './hash-chain.js';

const AuditRecordId = defineId('AuditRecordId');

/**
 * Storage contract for an audit chain. A real service appends to its own
 * local Postgres table under the same transaction as the business event
 * being audited (see PLAN.md §1.4 - every service keeps its own local
 * hash-chained table so tampering with one service's history is locally
 * detectable without needing another service's data), and separately
 * publishes the event to its outbox for the cross-service audit-index
 * aggregator. InMemoryAuditChainStore is for tests/dev only.
 */
export interface AuditChainStore {
  getLatest(streamId: string): Promise<AuditRecord | null>;
  append(streamId: string, record: AuditRecord): Promise<void>;
  getAll(streamId: string): Promise<AuditRecord[]>;
}

export class InMemoryAuditChainStore implements AuditChainStore {
  private readonly streams = new Map<string, AuditRecord[]>();

  async getLatest(streamId: string): Promise<AuditRecord | null> {
    const records = this.streams.get(streamId);
    return records && records.length > 0 ? records[records.length - 1]! : null;
  }

  async append(streamId: string, record: AuditRecord): Promise<void> {
    const records = this.streams.get(streamId) ?? [];
    records.push(record);
    this.streams.set(streamId, records);
  }

  async getAll(streamId: string): Promise<AuditRecord[]> {
    return [...(this.streams.get(streamId) ?? [])];
  }
}

/** Appends a new event to `streamId`'s chain, computing its prevHash from
 * whatever the current latest record is (or GENESIS_HASH for the first
 * event in the stream). `streamId` scopes independent chains - typically
 * one per service (see PLAN.md §1.4), not one per entity. */
export async function appendEvent(
  store: AuditChainStore,
  streamId: string,
  event: AuditEventInput,
): Promise<AuditRecord> {
  const latest = await store.getLatest(streamId);
  const prevHash = latest?.hash ?? GENESIS_HASH;
  const record = buildRecord(AuditRecordId.generate(), prevHash, event);
  await store.append(streamId, record);
  return record;
}
