import { Writable } from 'node:stream';
import pino from 'pino';
import { describe, expect, it } from 'vitest';
import { redact } from './redact.js';

// createLogger() itself hardcodes pino's default destination (stdout), so
// this test exercises the same wrap()-equivalent behavior directly against
// a capturable in-memory stream instead of re-parsing stdout.
function loggerToStream() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  const base = pino({ level: 'info' }, stream);
  return {
    lines,
    info: (obj: Record<string, unknown>, msg?: string) => base.info(redact(obj) as Record<string, unknown>, msg),
  };
}

describe('logger redaction integration', () => {
  it('a secret passed to info() never appears in the emitted line', () => {
    const { lines, info } = loggerToStream();
    info({ playerId: 'p_123', password: 'hunter2' }, 'login attempt');

    expect(lines).toHaveLength(1);
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.playerId).toBe('p_123');
    expect(parsed.password).toBe('[REDACTED]');
    expect(lines[0]).not.toContain('hunter2');
    expect(parsed.msg).toBe('login attempt');
  });
});
