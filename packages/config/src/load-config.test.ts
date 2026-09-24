import { ValidationError } from '@platform/errors';
import { describe, expect, it } from 'vitest';
import { nodeEnv, nonEmptyString, port } from './common-schemas.js';
import { loadConfig } from './load-config.js';
import { z } from 'zod';

const schema = z.object({
  PORT: port,
  DATABASE_URL: nonEmptyString,
  NODE_ENV: nodeEnv,
});

describe('loadConfig', () => {
  it('parses and coerces a valid env source', () => {
    const config = loadConfig(schema, {
      PORT: '4000',
      DATABASE_URL: 'postgres://localhost/ledger',
      NODE_ENV: 'production',
    });
    expect(config.PORT).toBe(4000);
    expect(typeof config.PORT).toBe('number');
    expect(config.DATABASE_URL).toBe('postgres://localhost/ledger');
    expect(config.NODE_ENV).toBe('production');
  });

  it('applies defaults for optional fields', () => {
    const config = loadConfig(schema, {
      PORT: '4000',
      DATABASE_URL: 'postgres://localhost/ledger',
    });
    expect(config.NODE_ENV).toBe('development');
  });

  it('throws a single ValidationError listing every failing field', () => {
    let caught: unknown;
    try {
      loadConfig(schema, { PORT: 'not-a-number' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    const err = caught as ValidationError;
    expect(err.meta.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'PORT' }),
        expect.objectContaining({ path: 'DATABASE_URL' }),
      ]),
    );
  });

  it('rejects a port outside the valid range', () => {
    expect(() =>
      loadConfig(schema, { PORT: '99999', DATABASE_URL: 'postgres://x' }),
    ).toThrow(ValidationError);
  });
});
