import argon2 from 'argon2';

/** Argon2id - duplicated from services/backoffice-api's identical file
 * per the "no cross-service imports" rule (see that file's own comment). */
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
