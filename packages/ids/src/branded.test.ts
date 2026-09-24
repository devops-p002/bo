import { describe, expect, expectTypeOf, it } from 'vitest';
import { defineId, type Id, randomId } from './branded.js';

const PlayerId = defineId('PlayerId');
const BetId = defineId('BetId');

describe('branded ids', () => {
  it('generate() produces a valid-looking ulid string', () => {
    const id = PlayerId.generate();
    expect(typeof id).toBe('string');
    expect(id).toHaveLength(26);
  });

  it('from() wraps an existing string as the branded type', () => {
    const id = PlayerId.from('existing-external-id');
    expect(id).toBe('existing-external-id');
  });

  it('randomId() produces a UUID-shaped string', () => {
    const id = randomId('SessionToken');
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('distinct brands are not assignable to each other at the type level', () => {
    const playerId = PlayerId.generate();
    const betId = BetId.generate();
    expectTypeOf(playerId).not.toEqualTypeOf(betId);
    // Runtime sanity: both are still plain strings under the hood.
    expect(typeof playerId).toBe(typeof betId);
  });

  it('type helper Id<B> is structurally a string', () => {
    const id: Id<'PlayerId'> = PlayerId.generate();
    expect(id.length).toBeGreaterThan(0);
  });
});
