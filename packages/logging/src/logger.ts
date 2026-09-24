import pino, { type Logger as PinoLogger } from 'pino';
import { redact } from './redact.js';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface CreateLoggerOptions {
  level?: LogLevel;
  /** Pretty-print for local dev; JSON lines (the default) for anything
   * that ships logs to a real aggregator. */
  pretty?: boolean;
}

export interface Logger {
  trace(obj: Record<string, unknown>, msg?: string): void;
  trace(msg: string): void;
  debug(obj: Record<string, unknown>, msg?: string): void;
  debug(msg: string): void;
  info(obj: Record<string, unknown>, msg?: string): void;
  info(msg: string): void;
  warn(obj: Record<string, unknown>, msg?: string): void;
  warn(msg: string): void;
  error(obj: Record<string, unknown>, msg?: string): void;
  error(msg: string): void;
  fatal(obj: Record<string, unknown>, msg?: string): void;
  fatal(msg: string): void;
  /** Returns a child logger with `bindings` merged into every subsequent
   * log line (e.g. requestId, playerId) - also passed through redact(). */
  child(bindings: Record<string, unknown>): Logger;
}

function wrap(pinoLogger: PinoLogger): Logger {
  const level =
    (name: LogLevel) =>
    (objOrMsg: Record<string, unknown> | string, msg?: string): void => {
      if (typeof objOrMsg === 'string') {
        pinoLogger[name](objOrMsg);
      } else {
        pinoLogger[name](redact(objOrMsg) as Record<string, unknown>, msg);
      }
    };

  return {
    trace: level('trace'),
    debug: level('debug'),
    info: level('info'),
    warn: level('warn'),
    error: level('error'),
    fatal: level('fatal'),
    child: (bindings) => wrap(pinoLogger.child(redact(bindings) as Record<string, unknown>)),
  };
}

/**
 * Creates a structured logger for a named service. Every object logged
 * through it is passed through redact() first (see redact.ts) - this is
 * the platform-wide backstop against secrets/PII landing in plain text
 * in a log line, on top of (not instead of) callers being careful about
 * what they log in the first place.
 */
export function createLogger(service: string, options: CreateLoggerOptions = {}): Logger {
  const base = pino({
    name: service,
    level: options.level ?? 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(options.pretty ? { transport: { target: 'pino-pretty' } } : {}),
  });
  return wrap(base);
}
