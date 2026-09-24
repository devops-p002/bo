import { describe, expect, it } from 'vitest';
import { isValidUlid, ulid } from './ulid.js';

describe('ulid', () => {
  it('generates a 26-character Crockford base32 string', () => {
    const id = ulid();
    expect(id).toHaveLength(26);
    expect(isValidUlid(id)).toBe(true);
  });

  it('is lexicographically sortable by creation time', () => {
    const earlier = ulid(1_700_000_000_000);
    const later = ulid(1_700_000_000_001);
    expect(earlier < later).toBe(true);
  });

  it('two ids generated at the same millisecond differ (random suffix)', () => {
    const t = Date.now();
    const a = ulid(t);
    const b = ulid(t);
    expect(a).not.toBe(b);
    // same time prefix, different random suffix
    expect(a.slice(0, 10)).toBe(b.slice(0, 10));
  });

  it('rejects a timestamp beyond 48 bits', () => {
    expect(() => ulid(2 ** 49)).toThrow(RangeError);
  });

  it('isValidUlid rejects malformed strings', () => {
    expect(isValidUlid('not-a-ulid')).toBe(false);
    expect(isValidUlid('')).toBe(false);
    // I, L, O, U are deliberately excluded from Crockford base32
    expect(isValidUlid('I'.repeat(26))).toBe(false);
  });
});
