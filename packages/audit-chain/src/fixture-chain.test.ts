import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { AuditRecord } from './hash-chain.js';
import { verifyChain } from './hash-chain.js';

const FIXTURE_DIR = fileURLToPath(new URL('../../../.fixtures/audit-chain/', import.meta.url));

function loadFixture(name: string): AuditRecord[] {
  return JSON.parse(readFileSync(`${FIXTURE_DIR}${name}`, 'utf8')) as AuditRecord[];
}

/**
 * `.fixtures/audit-chain/` is a permanent, committed fixture pair (see
 * its own README) proving verifyChain actually catches tampering -
 * services/backoffice-api's audit-verification CLI (PLAN.md Phase 6's
 * acceptance criterion) is tested against the same two files, so this
 * confirms the underlying primitive they both rely on.
 */
describe('verifyChain against the committed audit-chain fixture', () => {
  it('verifies the untampered fixture chain', () => {
    const chain = loadFixture('good-chain.json');
    expect(verifyChain(chain)).toEqual({ valid: true });
  });

  it('detects the hand-tampered fixture chain at the tampered record', () => {
    const chain = loadFixture('tampered-chain.json');
    const result = verifyChain(chain);
    expect(result.valid).toBe(false);
    expect(result.invalidAtIndex).toBe(2);
  });
});
