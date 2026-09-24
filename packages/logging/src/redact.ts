/**
 * Case-insensitive substring match against key names that, wherever they
 * appear in a logged object, mean the value must never reach a log line
 * in plain text (see PLAN.md's "audit-log every event, never log secrets
 * ... in plain text" non-negotiable). Deliberately broad and
 * substring-based rather than an exact key list: it's meant to be the
 * defense-in-depth backstop that still catches `newPassword`,
 * `xAuthToken`, `client_secret`, etc. without every caller having to
 * know the exact key spelling in advance.
 */
const SENSITIVE_KEY_PATTERN =
  /password|passwd|secret|token|authorization|api[-_]?key|private[-_]?key|xprv|mnemonic|seed[-_]?phrase|ssn|social[-_]?security|card[-_]?number|cvv|pin\b/i;

const REDACTED = '[REDACTED]';
const MAX_DEPTH = 8;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Recursively walks a value and replaces any value whose key matches
 * SENSITIVE_KEY_PATTERN with a fixed redaction marker. Non-matching
 * structure is deep-cloned (not mutated - callers may still hold the
 * original object elsewhere, e.g. to actually use the token).
 */
export function redact(value: unknown, depth = 0): unknown {
  if (depth >= MAX_DEPTH) return '[REDACTED:MAX_DEPTH]';

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1));
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }

  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(val, depth + 1);
    }
    return out;
  }

  return value;
}
