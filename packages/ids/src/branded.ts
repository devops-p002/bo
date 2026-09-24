import { randomUUID } from 'node:crypto';
import { ulid } from './ulid.js';

/**
 * Nominal (branded) string ids: `PlayerId` and `TransactionId` are both
 * plain strings at runtime but are distinct, non-interchangeable types at
 * compile time - passing a `PlayerId` where a `BetId` is expected is a
 * type error, catching a whole class of "wrong id in the wrong field"
 * bugs (particularly easy to make across a service boundary where both
 * are just `string` in a JSON payload) before they reach a query.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

export type Id<B extends string> = Brand<string, B>;

/** Creates a typed id constructor/validator pair for a given brand name.
 * `_brand` is a phantom parameter: only its literal type `B` is used (to
 * anchor the generic), never its runtime value. */
export function defineId<B extends string>(_brand: B) {
  const make = (value: string): Id<B> => value as Id<B>;
  return {
    /** Generates a new id (ULID by default - sortable, good for anything
     * written to a table with a natural creation order). */
    generate: (now?: number): Id<B> => make(ulid(now)),
    /** Wraps an externally-sourced id string (e.g. from a DB row or an
     * incoming request) as this brand, without regenerating it. */
    from: (value: string): Id<B> => make(value),
  };
}

/** Generates a random UUIDv4 as a branded id - use for ids that must not
 * leak creation-time ordering (e.g. externally-facing tokens), unlike
 * ULID's sortable ids. */
export function randomId<B extends string>(_brand: B): Id<B> {
  return randomUUID() as Id<B>;
}
