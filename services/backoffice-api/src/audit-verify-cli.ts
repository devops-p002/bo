import { readFileSync } from 'node:fs';
import type { AuditRecord } from '@platform/audit-chain';
import { verifyChain } from '@platform/audit-chain';
import { createLogger } from '@platform/logging';
import { loadBackofficeConfig } from './config.js';
import { createDb } from './db/connection.js';
import { AuditIndexService } from './audit-index.service.js';

const logger = createLogger('backoffice-api-audit-verify-cli');

/**
 * The audit-verification CLI named in PLAN.md Phase 6's acceptance
 * criterion: "the audit-verification CLI detects a hand-tampered row
 * in a fixture chain." Two modes:
 *
 *   --file <path>    verifies a JSON array of AuditRecords read
 *                     straight from disk - this is what's run against
 *                     .fixtures/audit-chain/good-chain.json and
 *                     tampered-chain.json.
 *   --stream <id>     verifies a live stream in this service's own
 *                     audit_index table (its own actions under
 *                     "backoffice-api-main", or a polled service's
 *                     "source:<name>" aggregate).
 *
 * Exits 0 and prints "valid" for an intact chain, exits 1 and prints
 * exactly which record failed and why for a tampered one - a script
 * (or CI) can gate on the exit code alone.
 */
async function main(): Promise<void> {
  const fileArgIndex = process.argv.indexOf('--file');
  const streamArgIndex = process.argv.indexOf('--stream');

  if (fileArgIndex !== -1) {
    const path = process.argv[fileArgIndex + 1];
    if (!path) throw new Error('--file requires a path argument');
    const records = JSON.parse(readFileSync(path, 'utf8')) as AuditRecord[];
    const result = verifyChain(records);
    report(path, result);
    process.exitCode = result.valid ? 0 : 1;
    return;
  }

  if (streamArgIndex !== -1) {
    const streamId = process.argv[streamArgIndex + 1];
    if (!streamId) throw new Error('--stream requires a stream id argument');
    const config = loadBackofficeConfig();
    const db = createDb({ connectionString: config.DATABASE_URL, max: 1 });
    try {
      const auditIndex = new AuditIndexService(db, []);
      const result = await auditIndex.verifyStream(streamId);
      report(streamId, result);
      process.exitCode = result.valid ? 0 : 1;
    } finally {
      await db.destroy();
    }
    return;
  }

  throw new Error('Usage: audit-verify-cli --file <path> | --stream <streamId>');
}

function report(label: string, result: ReturnType<typeof verifyChain>): void {
  if (result.valid) {
    logger.info({ label }, 'chain verified: valid');
  } else {
    logger.error({ label, invalidAtIndex: result.invalidAtIndex, reason: result.reason }, 'chain verification FAILED - tampering detected');
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'audit-verify-cli failed');
  process.exitCode = 1;
});
