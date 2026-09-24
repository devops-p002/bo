import { describe, expect, it } from 'vitest';
import {
  AccountLockedError,
  AppError,
  ConflictError,
  InternalError,
  NotFoundError,
  PermissionDeniedError,
  RefreshTokenReuseError,
  StepUpRequiredError,
  ValidationError,
  isAppError,
  toProblemDetails,
} from './app-error.js';

describe('AppError taxonomy', () => {
  it('each subclass carries its own code and HTTP status', () => {
    expect(new ValidationError('bad input').httpStatus).toBe(400);
    expect(new ValidationError('bad input').code).toBe('VALIDATION_ERROR');
    expect(new PermissionDeniedError().httpStatus).toBe(403);
    expect(new NotFoundError().httpStatus).toBe(404);
    expect(new ConflictError().httpStatus).toBe(409);
    expect(new InternalError().httpStatus).toBe(500);
    expect(new AccountLockedError().httpStatus).toBe(423);
    expect(new AccountLockedError().code).toBe('ACCOUNT_LOCKED');
    expect(new RefreshTokenReuseError().httpStatus).toBe(401);
    expect(new RefreshTokenReuseError().code).toBe('REFRESH_TOKEN_REUSE');
    expect(new StepUpRequiredError().httpStatus).toBe(403);
    expect(new StepUpRequiredError().code).toBe('STEP_UP_REQUIRED');
  });

  it('is a real Error subclass (instanceof, stack, message)', () => {
    const err = new ValidationError('amount must be positive');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe('amount must be positive');
    expect(err.stack).toBeDefined();
  });

  it('toProblemDetails serializes to the RFC 7807 shape', () => {
    const err = new NotFoundError('player not found', { meta: { playerId: 'abc' } });
    const problem = err.toProblemDetails('/players/abc');
    expect(problem).toMatchObject({
      title: 'NotFoundError',
      status: 404,
      detail: 'player not found',
      code: 'NOT_FOUND',
      instance: '/players/abc',
      playerId: 'abc',
    });
    expect(problem.type).toContain('NOT_FOUND');
  });

  it('isAppError narrows correctly', () => {
    expect(isAppError(new ValidationError('x'))).toBe(true);
    expect(isAppError(new Error('plain'))).toBe(false);
    expect(isAppError('not an error')).toBe(false);
  });

  it('toProblemDetails maps a non-AppError to a generic 500 without leaking its message', () => {
    const secretish = new Error('db connection string: postgres://user:hunter2@host/db');
    const problem = toProblemDetails(secretish);
    expect(problem.status).toBe(500);
    expect(problem.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(problem)).not.toContain('hunter2');
  });

  it('toProblemDetails passes an AppError through with its own status/code', () => {
    const err = new ConflictError('already settled');
    const problem = toProblemDetails(err);
    expect(problem.status).toBe(409);
    expect(problem.detail).toBe('already settled');
  });
});
