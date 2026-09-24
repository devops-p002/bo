import { describe, expect, it } from 'vitest';
import { GENESIS_HASH, buildRecord, verifyChain } from './hash-chain.js';
import { InMemoryAuditChainStore, appendEvent } from './store.js';

function event(overrides: Partial<Parameters<typeof buildRecord>[2]> = {}) {
  return {
    eventType: 'balance.credited',
    occurredAt: '2026-01-01T00:00:00.000Z',
    actor: 'system:ledger',
    payload: { amountMinor: '1000', asset: 'USD' },
    ...overrides,
  };
}

describe('hash chain', () => {
  it('the first record in a chain uses GENESIS_HASH as its prevHash', async () => {
    const store = new InMemoryAuditChainStore();
    const record = await appendEvent(store, 'stream-1', event());
    expect(record.prevHash).toBe(GENESIS_HASH);
  });

  it('each record\'s hash covers the previous record\'s hash', async () => {
    const store = new InMemoryAuditChainStore();
    const first = await appendEvent(store, 'stream-1', event({ eventType: 'a' }));
    const second = await appendEvent(store, 'stream-1', event({ eventType: 'b' }));
    expect(second.prevHash).toBe(first.hash);
  });

  it('a clean, untampered chain verifies', async () => {
    const store = new InMemoryAuditChainStore();
    await appendEvent(store, 'stream-1', event({ eventType: 'a' }));
    await appendEvent(store, 'stream-1', event({ eventType: 'b' }));
    await appendEvent(store, 'stream-1', event({ eventType: 'c' }));

    const records = await store.getAll('stream-1');
    expect(verifyChain(records)).toEqual({ valid: true });
  });

  it('detects a payload edited after the fact', async () => {
    const store = new InMemoryAuditChainStore();
    await appendEvent(store, 'stream-1', event({ payload: { amountMinor: '1000' } }));
    await appendEvent(store, 'stream-1', event({ payload: { amountMinor: '2000' } }));

    const records = await store.getAll('stream-1');
    // Tamper: silently change the first record's payload without
    // recomputing anything downstream, exactly like an attacker or a
    // buggy migration touching the raw table would.
    const tampered = [{ ...records[0]!, payload: { amountMinor: '999999' } }, records[1]!];

    const result = verifyChain(tampered);
    expect(result.valid).toBe(false);
    expect(result.invalidAtIndex).toBe(0);
  });

  it('detects a record deleted from the middle of the chain', async () => {
    const store = new InMemoryAuditChainStore();
    await appendEvent(store, 'stream-1', event({ eventType: 'a' }));
    await appendEvent(store, 'stream-1', event({ eventType: 'b' }));
    await appendEvent(store, 'stream-1', event({ eventType: 'c' }));

    const records = await store.getAll('stream-1');
    const withDeletion = [records[0]!, records[2]!]; // drop the middle record

    const result = verifyChain(withDeletion);
    expect(result.valid).toBe(false);
    expect(result.invalidAtIndex).toBe(1);
  });

  it('detects records reordered', async () => {
    const store = new InMemoryAuditChainStore();
    await appendEvent(store, 'stream-1', event({ eventType: 'a' }));
    await appendEvent(store, 'stream-1', event({ eventType: 'b' }));

    const records = await store.getAll('stream-1');
    const reordered = [records[1]!, records[0]!];

    expect(verifyChain(reordered).valid).toBe(false);
  });

  it('detects a forged prevHash pointer even if the forged record\'s own hash is self-consistent', () => {
    // Build a record whose hash is internally correct for its own
    // fields, but whose prevHash claims to follow a hash it doesn't
    // actually follow.
    const forged = buildRecord('id-1', 'a'.repeat(64), event());
    const result = verifyChain([forged]);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('prevHash');
  });

  it('an empty chain trivially verifies', () => {
    expect(verifyChain([])).toEqual({ valid: true });
  });

  it('independent streams have independent chains', async () => {
    const store = new InMemoryAuditChainStore();
    const a1 = await appendEvent(store, 'stream-a', event());
    const b1 = await appendEvent(store, 'stream-b', event());
    expect(a1.prevHash).toBe(GENESIS_HASH);
    expect(b1.prevHash).toBe(GENESIS_HASH);
    expect(a1.hash).not.toBe(b1.hash);
  });
});
