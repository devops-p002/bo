import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';

export interface ConnectionOptions {
  connectionString: string;
  max?: number;
}

pg.types.setTypeParser(20, (value) => value);

export function createDb(options: ConnectionOptions): Kysely<Database> {
  const pool = new pg.Pool({ connectionString: options.connectionString, max: options.max ?? 10 });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}
