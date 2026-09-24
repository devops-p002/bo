import { describe, expect, it } from 'vitest';
import { redact } from './redact.js';

describe('redact', () => {
  it('masks top-level keys matching common secret names', () => {
    const out = redact({ password: 'hunter2', username: 'alice' }) as Record<string, unknown>;
    expect(out.password).toBe('[REDACTED]');
    expect(out.username).toBe('alice');
  });

  it('masks nested secret-shaped keys regardless of depth', () => {
    const out = redact({
      user: { profile: { apiKey: 'sk_live_abc123', name: 'bob' } },
    }) as any;
    expect(out.user.profile.apiKey).toBe('[REDACTED]');
    expect(out.user.profile.name).toBe('bob');
  });

  it('matches case-insensitively and by substring (camelCase, snake_case)', () => {
    const out = redact({
      AuthorizationHeader: 'Bearer xyz',
      client_secret: 'abc',
      newPassword: 'p@ss',
      xAuthToken: 'tok',
    }) as Record<string, unknown>;
    expect(out.AuthorizationHeader).toBe('[REDACTED]');
    expect(out.client_secret).toBe('[REDACTED]');
    expect(out.newPassword).toBe('[REDACTED]');
    expect(out.xAuthToken).toBe('[REDACTED]');
  });

  it('redacts crypto key material and financial identifiers', () => {
    const out = redact({
      xprv: 'xprv9s21ZrQH...',
      mnemonic: 'abandon abandon abandon...',
      cardNumber: '4111111111111111',
      cvv: '123',
    }) as Record<string, unknown>;
    expect(out.xprv).toBe('[REDACTED]');
    expect(out.mnemonic).toBe('[REDACTED]');
    expect(out.cardNumber).toBe('[REDACTED]');
    expect(out.cvv).toBe('[REDACTED]');
  });

  it('redacts values inside arrays of objects', () => {
    const out = redact({
      sessions: [{ token: 'a' }, { token: 'b' }],
    }) as any;
    expect(out.sessions[0].token).toBe('[REDACTED]');
    expect(out.sessions[1].token).toBe('[REDACTED]');
  });

  it('converts Error objects to plain name/message/stack without losing them silently', () => {
    const out = redact({ err: new Error('boom') }) as any;
    expect(out.err.message).toBe('boom');
    expect(out.err.name).toBe('Error');
  });

  it('does not mutate the original object', () => {
    const original = { password: 'hunter2' };
    redact(original);
    expect(original.password).toBe('hunter2');
  });

  it('passes through non-sensitive primitives and null unchanged', () => {
    expect(redact('hello')).toBe('hello');
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBe(null);
    expect(redact(undefined)).toBe(undefined);
  });

  it('terminates on pathologically deep objects instead of recursing forever', () => {
    let deep: any = { value: 'leaf' };
    for (let i = 0; i < 50; i++) {
      deep = { nested: deep };
    }
    expect(() => redact(deep)).not.toThrow();
  });
});
