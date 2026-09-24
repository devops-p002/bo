import { ValidationError } from '@platform/errors';
import type { ZodError, ZodType, ZodTypeDef } from 'zod';

/**
 * Validates `process.env` (or an explicit source, for testing) against a
 * zod schema and returns the parsed, typed config - or throws a single
 * ValidationError listing every failing field at once, rather than a
 * service discovering its misconfiguration one missing variable at a
 * time across several restarts. Intended to be called once at service
 * startup, before anything else runs (fail fast, not fail confusing).
 *
 * Takes `ZodType<T, ZodTypeDef, any>` rather than the `ZodSchema<T>`
 * shorthand (which pins Input=Output) deliberately: every real config
 * schema has a different Input than Output (`.default()`, `z.coerce`),
 * and pinning them equal corrupts T's inference the moment that happens
 * - `T` would come out with the input side's optional/string-typed
 * fields leaking into what's supposed to be the fully-defaulted,
 * coerced output type.
 */
export function loadConfig<T>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  source: Record<string, string | undefined> = process.env,
): T {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new ValidationError('Invalid configuration', {
      detail: formatZodError(result.error),
      meta: { issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
    });
  }
  return result.data;
}

function formatZodError(error: ZodError): string {
  const lines = error.issues.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  return `Configuration validation failed:\n${lines.join('\n')}`;
}
