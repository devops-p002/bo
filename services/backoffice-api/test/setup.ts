import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync } from 'node:fs';
import pg from 'pg';

/**
 * Real Postgres (backoffice_api_app's actual grants) PLUS a real running
 * services/ledger HTTP server, spun up against its OWN dedicated
 * database (`ledger_for_backoffice_tests`, not the `ledger` database
 * services/ledger's own suite truncates, nor any other service's
 * `ledger_for_*_tests` - see platform/CLAUDE.md's port/database
 * collision discipline) so a maker-checker `balance_adjustment`
 * approval can be proven to post a REAL ledger journal end to end, not
 * a mocked HTTP call.
 *
 * Every other downstream service maker-checker can execute against
 * (sportsbook, responsible-gambling) and every other audit-events
 * source backoffice-api polls (account, crypto, game-wallet,
 * sportsbook, bonus, responsible-gambling, risk) is deliberately left
 * unreachable in this suite (SOMETHING_BASE_URL pointed at a port
 * nothing binds) - this is what exercises AuditIndexService.pollOnce's
 * "an unreachable source must not crash the poll" fix, and no test
 * here needs those services' real business logic (odds_override,
 * manual_settlement, limit_change already have their own coverage in
 * services/sportsbook and services/responsible-gambling's own suites).
 */
const BACKOFFICE_PORT = 5099;
const BACKOFFICE_BASE_URL = `http://127.0.0.1:${BACKOFFICE_PORT}`;
const LEDGER_PORT = 4195;
const LEDGER_BASE_URL = `http://127.0.0.1:${LEDGER_PORT}`;
const ACCOUNT_PORT = 4201;
const ACCOUNT_BASE_URL = `http://127.0.0.1:${ACCOUNT_PORT}`;
const UNREACHABLE_URL = 'http://127.0.0.1:1';

const ADMIN_JWT_SECRET = 'test-only-backoffice-jwt-secret';

const APP_URL =
  process.env.BACKOFFICE_TEST_APP_DATABASE_URL ??
  'postgres://backoffice_api_app:dev_only_backoffice_api_password@localhost:5432/backoffice_api';
const SUPERUSER_URL = 'postgres://postgres:postgres@localhost:5432/backoffice_api';
const LEDGER_DATABASE_URL =
  process.env.LEDGER_FOR_BACKOFFICE_TESTS_URL ??
  'postgres://ledger_app:dev_only_ledger_password@localhost:5432/ledger_for_backoffice_tests';
const LEDGER_SUPERUSER_URL = 'postgres://postgres:postgres@localhost:5432/ledger_for_backoffice_tests';
const ACCOUNT_DATABASE_URL =
  process.env.ACCOUNT_FOR_BACKOFFICE_TESTS_URL ??
  'postgres://account_app:dev_only_account_password@localhost:5432/account_for_backoffice_tests';
const ACCOUNT_SUPERUSER_URL = 'postgres://postgres:postgres@localhost:5432/account_for_backoffice_tests';

let backofficeProcess: ChildProcessWithoutNullStreams | undefined;
let ledgerProcess: ChildProcessWithoutNullStreams | undefined;
let accountProcess: ChildProcessWithoutNullStreams | undefined;

async function waitForHttp(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`timed out waiting for ${url} to respond: ${String(lastError)}`);
}

export async function startLedger(): Promise<void> {
  const ledgerDir = new URL('../../ledger', import.meta.url).pathname;
  if (!existsSync(`${ledgerDir}/dist/main.js`)) {
    throw new Error('services/ledger/dist/main.js not found - build it first (cd ../ledger && pnpm build), since this suite boots a real ledger server');
  }

  const client = new pg.Client({ connectionString: LEDGER_SUPERUSER_URL });
  await client.connect();
  await client.query('TRUNCATE entries, journals, holds, accounts, idempotency_keys, audit_events, reconciliation_runs CASCADE');
  await client.end();

  ledgerProcess = spawn('node', ['dist/main.js'], {
    cwd: ledgerDir,
    env: { ...process.env, DATABASE_URL: LEDGER_DATABASE_URL, PORT: String(LEDGER_PORT), NODE_ENV: 'development' },
    stdio: 'pipe',
  });
  ledgerProcess.stdout.on('data', () => {});
  ledgerProcess.stderr.on('data', () => {});
  await waitForHttp(`${LEDGER_BASE_URL}/accounts/nonexistent/balance`, 20000);
}

export async function startAccount(): Promise<void> {
  const accountDir = new URL('../../account', import.meta.url).pathname;
  if (!existsSync(`${accountDir}/dist/main.js`)) {
    throw new Error('services/account/dist/main.js not found - build it first (cd ../account && pnpm build), since player-lookup tests need a real account server');
  }

  const client = new pg.Client({ connectionString: ACCOUNT_SUPERUSER_URL });
  await client.connect();
  await client.query('TRUNCATE players, password_credentials, totp_credentials, webauthn_credentials, webauthn_challenges, devices, refresh_token_families, refresh_tokens, step_up_challenges, login_lockouts, audit_events CASCADE');
  await client.end();

  accountProcess = spawn('node', ['dist/main.js'], {
    cwd: accountDir,
    env: { ...process.env, DATABASE_URL: ACCOUNT_DATABASE_URL, PORT: String(ACCOUNT_PORT), NODE_ENV: 'development', JWT_ACCESS_SECRET: 'test-only-account-jwt-secret' },
    stdio: 'pipe',
  });
  accountProcess.stdout.on('data', () => {});
  accountProcess.stderr.on('data', () => {});
  await waitForHttp(`${ACCOUNT_BASE_URL}/admin/players/nonexistent`, 20000);
}

export async function registerAccountPlayer(email: string): Promise<string> {
  const response = await fetch(`${ACCOUNT_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'correcthorsebattery1' }),
  });
  if (!response.ok) throw new Error(`registerAccountPlayer failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { playerId: string };
  return body.playerId;
}

export async function startBackoffice(): Promise<void> {
  const dir = new URL('..', import.meta.url).pathname;
  if (!existsSync(`${dir}/dist/main.js`)) {
    throw new Error('services/backoffice-api/dist/main.js not found - build it first (pnpm build)');
  }

  const client = new pg.Client({ connectionString: SUPERUSER_URL });
  await client.connect();
  await client.query('TRUNCATE admin_users, role_assignments, maker_checker_requests, case_queue_items, break_glass_grants, audit_index, audit_index_watermarks CASCADE');
  await client.end();

  backofficeProcess = spawn('node', ['dist/main.js'], {
    cwd: dir,
    env: {
      ...process.env,
      DATABASE_URL: APP_URL,
      PORT: String(BACKOFFICE_PORT),
      NODE_ENV: 'development',
      ADMIN_JWT_SECRET,
      LEDGER_BASE_URL,
      ACCOUNT_BASE_URL,
      SPORTSBOOK_BASE_URL: UNREACHABLE_URL,
      RESPONSIBLE_GAMBLING_BASE_URL: UNREACHABLE_URL,
      LEDGER_AUDIT_URL: LEDGER_BASE_URL,
      ACCOUNT_AUDIT_URL: UNREACHABLE_URL,
      CRYPTO_AUDIT_URL: UNREACHABLE_URL,
      GAME_WALLET_AUDIT_URL: UNREACHABLE_URL,
      SPORTSBOOK_AUDIT_URL: UNREACHABLE_URL,
      BONUS_AUDIT_URL: UNREACHABLE_URL,
      RESPONSIBLE_GAMBLING_AUDIT_URL: UNREACHABLE_URL,
      RISK_AUDIT_URL: UNREACHABLE_URL,
    },
    stdio: 'pipe',
  });
  // Drain stdout/stderr so the child's writes never block once the OS
  // pipe buffer fills - this suite logs a lot more HTTP traffic (many
  // admin creations, logins, maker-checker/break-glass/audit-index
  // requests) than most other services' test suites, and an unread
  // pipe is a real way for a spawned child to silently stall.
  backofficeProcess.stdout.on('data', () => {});
  backofficeProcess.stderr.on('data', () => {});
  await waitForHttp(`${BACKOFFICE_BASE_URL}/nonexistent`, 20000);
}

export function stopProcesses(): void {
  backofficeProcess?.kill('SIGKILL');
  ledgerProcess?.kill('SIGKILL');
  accountProcess?.kill('SIGKILL');
}

export { BACKOFFICE_BASE_URL, LEDGER_BASE_URL, ADMIN_JWT_SECRET };

export function createSuperuserPgClient(): pg.Client {
  return new pg.Client({ connectionString: SUPERUSER_URL });
}

let adminCounter = 0;
export async function createAdminUser(roles: string[], passwordOverride?: string): Promise<{ id: string; email: string; password: string }> {
  adminCounter += 1;
  const email = `admin${adminCounter}-${Date.now()}@platform.internal`;
  const password = passwordOverride ?? 'correcthorsebattery1';
  const response = await fetch(`${BACKOFFICE_BASE_URL}/admin-users`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, roles }),
  });
  if (!response.ok) throw new Error(`createAdminUser failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { id: string };
  return { id: body.id, email, password };
}

export async function login(email: string, password: string): Promise<string> {
  const response = await fetch(`${BACKOFFICE_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(`login failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { accessToken: string };
  return body.accessToken;
}

export async function loginAsRole(roles: string[]): Promise<{ token: string; id: string; email: string }> {
  const { id, email, password } = await createAdminUser(roles);
  const token = await login(email, password);
  return { token, id, email };
}

export async function createLedgerAccount(): Promise<string> {
  const response = await fetch(`${LEDGER_BASE_URL}/accounts`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': `test-${Math.random()}` },
    body: JSON.stringify({ ownerType: 'house', ownerId: null, asset: 'USD', decimals: 2, allowNegative: true }),
  });
  if (!response.ok) throw new Error(`createLedgerAccount failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { id: string };
  return body.id;
}

export async function getLedgerBalance(accountId: string): Promise<bigint> {
  const response = await fetch(`${LEDGER_BASE_URL}/accounts/${accountId}/balance`);
  if (!response.ok) throw new Error(`getLedgerBalance failed: ${response.status} ${await response.text()}`);
  const body = (await response.json()) as { balanceMinor: string };
  return BigInt(body.balanceMinor);
}
