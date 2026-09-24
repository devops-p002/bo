/**
 * RFC 7807 "Problem Details for HTTP APIs" shape. Every service in this
 * platform serializes errors this way so any client (player web, admin
 * web, mobile, another service) gets one consistent error contract.
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  [extension: string]: unknown;
}

export interface AppErrorOptions {
  detail?: string;
  cause?: unknown;
  /** Extra machine-readable fields safe to expose to the caller (never put
   * secrets, tokens, or PII here - this rides straight into the HTTP
   * response body). */
  meta?: Record<string, unknown>;
}

/**
 * Base of the platform's typed error taxonomy. Each subclass fixes a
 * `code` and `httpStatus` so throwing the right subclass is the whole
 * contract - no service needs to remember which status code goes with
 * which situation.
 */
export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly meta: Record<string, unknown>;

  constructor(code: string, httpStatus: number, message: string, options: AppErrorOptions = {}) {
    super(options.detail ?? message, { cause: options.cause });
    this.name = new.target.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.meta = options.meta ?? {};
    Error.captureStackTrace?.(this, new.target);
  }

  toProblemDetails(instance?: string): ProblemDetails {
    return {
      type: `https://errors.platform.internal/${this.code}`,
      title: this.name,
      status: this.httpStatus,
      detail: this.message,
      code: this.code,
      ...(instance ? { instance } : {}),
      ...this.meta,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, options?: AppErrorOptions) {
    super('VALIDATION_ERROR', 400, message, options);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required', options?: AppErrorOptions) {
    super('UNAUTHENTICATED', 401, message, options);
  }
}

export class PermissionDeniedError extends AppError {
  constructor(message = 'Permission denied', options?: AppErrorOptions) {
    super('PERMISSION_DENIED', 403, message, options);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', options?: AppErrorOptions) {
    super('NOT_FOUND', 404, message, options);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', options?: AppErrorOptions) {
    super('CONFLICT', 409, message, options);
  }
}

/** An idempotency key was reused with a materially different request body
 * (see @platform/idempotency) - distinct from a plain ConflictError so
 * callers can special-case "you sent a different request under a key
 * you've already used" versus a generic resource conflict. */
export class IdempotencyKeyReuseError extends AppError {
  constructor(message = 'Idempotency key reused with a different request', options?: AppErrorOptions) {
    super('IDEMPOTENCY_KEY_REUSE', 409, message, options);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests', options?: AppErrorOptions) {
    super('RATE_LIMITED', 429, message, options);
  }
}

/** The account is temporarily locked out after too many failed login
 * attempts (see the account service's login-lockout tracker) - distinct
 * from RateLimitedError, which is about request volume, not
 * authentication failures against one identifier. */
export class AccountLockedError extends AppError {
  constructor(message = 'Account temporarily locked', options?: AppErrorOptions) {
    super('ACCOUNT_LOCKED', 423, message, options);
  }
}

/** A refresh token that was already rotated (its `rotated_at` is set)
 * was presented again - reuse of a token that should no longer exist on
 * the legitimate client. The whole token family is revoked as a side
 * effect of detecting this, not just the one token. */
export class RefreshTokenReuseError extends AppError {
  constructor(message = 'Refresh token reuse detected; session revoked', options?: AppErrorOptions) {
    super('REFRESH_TOKEN_REUSE', 401, message, options);
  }
}

/** The caller's access token is valid, but the action they're attempting
 * requires a fresh, action-scoped step-up (re-)authentication that
 * hasn't been completed (or has expired) - distinct from
 * UnauthenticatedError, which means no valid session at all. */
export class StepUpRequiredError extends AppError {
  constructor(message = 'Step-up authentication required for this action', options?: AppErrorOptions) {
    super('STEP_UP_REQUIRED', 403, message, options);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error', options?: AppErrorOptions) {
    super('INTERNAL_ERROR', 500, message, options);
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Converts any thrown value to ProblemDetails, mapping non-AppErrors to a
 * generic 500 without leaking their (potentially sensitive) message. */
export function toProblemDetails(err: unknown, instance?: string): ProblemDetails {
  if (isAppError(err)) {
    return err.toProblemDetails(instance);
  }
  return new InternalError().toProblemDetails(instance);
}
