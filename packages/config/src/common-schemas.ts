import { z } from 'zod';

/** A handful of validators reused across most services' env schemas, so
 * "port must be a number between 1-65535" etc. isn't redefined N times
 * with N slightly different mistakes. */
export const port = z.coerce.number().int().min(1).max(65535);
export const nodeEnv = z.enum(['development', 'test', 'production']).default('development');
export const url = z.string().url();
export const nonEmptyString = z.string().min(1);
