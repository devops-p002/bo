import argon2 from 'argon2';

/** Argon2id - see services/account's identical file for the rationale;
 * duplicated rather than imported per PLAN.md's "no cross-service
 * imports" non-negotiable. */
export async function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plaintext: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plaintext);
  } catch {
    return false;
  }
}
