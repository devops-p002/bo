import { randomBytes } from 'node:crypto';

/**
 * Minimal ULID (https://github.com/ulid/spec) implementation: 48-bit
 * millisecond timestamp + 80 bits of randomness, both Crockford base32
 * encoded, 26 characters total. Lexicographically sortable by creation
 * time, unlike a UUIDv4 - the property the ledger's journal/entry ids
 * want (insertion order readable straight from the id, useful for
 * debugging and for cheap range queries without a separate created_at
 * index lookup).
 *
 * Implemented locally rather than pulling in a dependency for ~40 lines
 * of well-specified, stable algorithm.
 */
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ENCODING_LEN = CROCKFORD_ALPHABET.length; // 32
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function encodeTime(now: number): string {
  if (now > 0xffffffffffff) {
    throw new RangeError('ULID timestamp exceeds 48 bits');
  }
  let mod: number;
  let chars = '';
  let time = now;
  for (let i = TIME_LEN; i > 0; i--) {
    mod = time % ENCODING_LEN;
    chars = CROCKFORD_ALPHABET.charAt(mod) + chars;
    time = (time - mod) / ENCODING_LEN;
  }
  return chars;
}

function encodeRandom(): string {
  const bytes = randomBytes(RANDOM_LEN);
  let chars = '';
  for (let i = 0; i < RANDOM_LEN; i++) {
    chars += CROCKFORD_ALPHABET.charAt(bytes[i]! % ENCODING_LEN);
  }
  return chars;
}

export function ulid(now: number = Date.now()): string {
  return encodeTime(now) + encodeRandom();
}

const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

export function isValidUlid(value: string): boolean {
  return ULID_PATTERN.test(value);
}
