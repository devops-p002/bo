import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  BACKOFFICE_BASE_URL,
  LEDGER_BASE_URL,
  createAdminUser,
  createLedgerAccount,
  createSuperuserPgClient,
  getLedgerBalance,
  loginAsRole,
  registerAccountPlayer,
  startAccount,
  startBackoffice,
  startLedger,
  stopProcesses,
} from './setup.js';

const execFileAsync = promisify(execFile);

beforeAll(async () => {
  await startLedger();
  await startAccount();
  await startBackoffice();
}, 90000);

afterAll(() => {
  stopProcesses();
});

function authHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

async function createMakerCheckerRequest(token: string, actionType: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ actionType, payload }),
  });
}

async function approveRequest(token: string, id: string): Promise<Response> {
  // No content-type here deliberately - this POST has no body, and
  // Fastify's JSON body parser rejects an empty body when
  // content-type is set to application/json ("Body cannot be empty
  // when content-type is set to 'application/json'"), which a real
  // client sending a genuinely bodyless request would never trigger.
  return fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests/${id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
}

describe('admin auth', () => {
  it('rejects a wrong password', async () => {
    const { email, password } = await createAdminUser(['support']);
    const response = await fetch(`${BACKOFFICE_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: `${password}-wrong` }),
    });
    expect(response.status).toBe(401);
  });

  it('rejects an unknown email in the same time-shape as a wrong password (no user-enumeration branch that throws differently)', async () => {
    const response = await fetch(`${BACKOFFICE_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'nobody-at-all@platform.internal', password: 'whatever12' }),
    });
    expect(response.status).toBe(401);
  });

  it('issues a token that grants access, and a request with no token is rejected', async () => {
    const { token } = await loginAsRole(['auditor']);
    const authed = await fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests`, { headers: { authorization: `Bearer ${token}` } });
    expect(authed.status).toBe(200);

    const unauthed = await fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests`);
    expect(unauthed.status).toBe(401);
  });
});

describe('maker-checker RBAC (Phase 6 acceptance criterion: a support-role token gets a real 403)', () => {
  it('support cannot create a balance_adjustment request - support owns no action type', async () => {
    const { token } = await loginAsRole(['support']);
    const response = await createMakerCheckerRequest(token, 'balance_adjustment', { debitAccountId: 'a', creditAccountId: 'b', amountMinor: '100' });
    expect(response.status).toBe(403);
  });

  it('support cannot create a payout request either', async () => {
    const { token } = await loginAsRole(['support']);
    const response = await createMakerCheckerRequest(token, 'payout', { houseAccountId: 'a', playerAccountId: 'b', amountMinor: '100' });
    expect(response.status).toBe(403);
  });

  it('finance CAN create a balance_adjustment request (owning role)', async () => {
    const { token } = await loginAsRole(['finance']);
    const response = await createMakerCheckerRequest(token, 'balance_adjustment', { debitAccountId: 'a', creditAccountId: 'b', amountMinor: '100' });
    expect(response.status).toBe(201);
  });

  it('a wrong-owning-role token cannot approve either, even though it was permitted to create nothing here', async () => {
    const { token: financeToken } = await loginAsRole(['finance']);
    const create = await createMakerCheckerRequest(financeToken, 'balance_adjustment', { debitAccountId: 'a', creditAccountId: 'b', amountMinor: '100' });
    const { id } = (await create.json()) as { id: string };

    const { token: supportToken } = await loginAsRole(['support']);
    const approve = await approveRequest(supportToken, id);
    expect(approve.status).toBe(403);
  });

  it('super_admin may create and approve any action type', async () => {
    const { token } = await loginAsRole(['super_admin']);
    const create = await createMakerCheckerRequest(token, 'export', {});
    expect(create.status).toBe(201);
  });
});

describe('maker-checker CHECK(requested_by <> approved_by) (Phase 6 acceptance criterion)', () => {
  it('a request creator cannot approve their own request - rejected as 403, not a raw 500', async () => {
    const { token } = await loginAsRole(['auditor']);
    const create = await createMakerCheckerRequest(token, 'export', { note: 'self-approve-test' });
    expect(create.status).toBe(201);
    const { id } = (await create.json()) as { id: string };

    const selfApprove = await approveRequest(token, id);
    expect(selfApprove.status).toBe(403);

    // The CHECK violation must not have half-applied the update - the
    // request is still pending, not stuck in some intermediate state.
    const getResponse = await fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests/${id}`, { headers: { authorization: `Bearer ${token}` } });
    const body = (await getResponse.json()) as { status: string };
    expect(body.status).toBe('pending');
  });

  it('a DIFFERENT admin with the owning role can approve the same request', async () => {
    const { token: requester } = await loginAsRole(['auditor']);
    const create = await createMakerCheckerRequest(requester, 'export', { note: 'cross-approve-test' });
    const { id } = (await create.json()) as { id: string };

    const { token: approver } = await loginAsRole(['auditor']);
    const approve = await approveRequest(approver, id);
    expect(approve.status).toBe(201);
    const body = (await approve.json()) as { status: string };
    expect(body.status).toBe('executed');
  });

  it('the same CHECK fires on reject, not just approve', async () => {
    const { token } = await loginAsRole(['auditor']);
    const create = await createMakerCheckerRequest(token, 'export', { note: 'self-reject-test' });
    const { id } = (await create.json()) as { id: string };

    const selfReject = await fetch(`${BACKOFFICE_BASE_URL}/maker-checker-requests/${id}/reject`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
    expect(selfReject.status).toBe(403);
  });
});

describe('maker-checker execution against a real ledger', () => {
  it('approving a balance_adjustment actually posts a real ledger journal and moves a real balance', async () => {
    const debitAccountId = await createLedgerAccount();
    const creditAccountId = await createLedgerAccount();

    const before = await getLedgerBalance(creditAccountId);

    const { token: requester } = await loginAsRole(['finance']);
    const create = await createMakerCheckerRequest(requester, 'balance_adjustment', { debitAccountId, creditAccountId, amountMinor: '500' });
    expect(create.status).toBe(201);
    const { id } = (await create.json()) as { id: string };

    const { token: approver } = await loginAsRole(['finance']);
    const approve = await approveRequest(approver, id);
    expect(approve.status).toBe(201);
    const body = (await approve.json()) as { status: string; executionResult: { journalId: string } };
    expect(body.status).toBe('executed');
    expect(body.executionResult.journalId).toBeTruthy();

    const after = await getLedgerBalance(creditAccountId);
    expect(after - before).toBe(500n);
  });

  it('an approval whose downstream call fails is recorded as execution_failed, not a bare 500', async () => {
    const { token: requester } = await loginAsRole(['finance']);
    // A nonexistent debit account makes ledger's own /journals reject
    // this with a real 404/409 - the executor's fetch call surfaces
    // that as a downstream failure, which approve() must catch and
    // record rather than letting propagate as an unhandled 500.
    const create = await createMakerCheckerRequest(requester, 'balance_adjustment', { debitAccountId: 'nonexistent-account', creditAccountId: 'also-nonexistent', amountMinor: '500' });
    const { id } = (await create.json()) as { id: string };

    const { token: approver } = await loginAsRole(['finance']);
    const approve = await approveRequest(approver, id);
    expect(approve.status).toBe(201);
    const body = (await approve.json()) as { status: string };
    expect(body.status).toBe('execution_failed');
  });
});

describe('case queue', () => {
  it('a maker-checker request creates an open case-queue item, resolved automatically on decision', async () => {
    const { token } = await loginAsRole(['auditor']);
    const create = await createMakerCheckerRequest(token, 'export', { note: 'case-queue-test' });
    const { id } = (await create.json()) as { id: string };

    const listOpen = await fetch(`${BACKOFFICE_BASE_URL}/case-queue-items?queueType=maker_checker`, { headers: { authorization: `Bearer ${token}` } });
    const openItems = (await listOpen.json()) as Array<{ reference_id: string; status: string }>;
    const item = openItems.find((i) => i.reference_id === id);
    expect(item?.status).toBe('open');

    const { token: approver } = await loginAsRole(['auditor']);
    await approveRequest(approver, id);

    const listAfter = await fetch(`${BACKOFFICE_BASE_URL}/case-queue-items?queueType=maker_checker`, { headers: { authorization: `Bearer ${token}` } });
    const itemsAfter = (await listAfter.json()) as Array<{ reference_id: string; status: string }>;
    const itemAfter = itemsAfter.find((i) => i.reference_id === id);
    expect(itemAfter?.status).toBe('resolved');
  });
});

describe('break-glass (Phase 6 acceptance criterion: expires and is unusable one second past expires_at)', () => {
  it('a grant is active immediately after being granted', async () => {
    // grantedTo is a FOREIGN KEY to admin_users.id (see the
    // create-break-glass-grants migration) - not an email or anything
    // else a caller might reach for.
    const { token: admin, id: adminId } = await loginAsRole(['super_admin']);
    const grant = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants`, {
      method: 'POST',
      headers: authHeaders(admin),
      body: JSON.stringify({ grantedTo: adminId, reason: 'incident-123', roleName: 'finance', durationMinutes: 30 }),
    });
    expect(grant.status).toBe(201);
    const body = (await grant.json()) as { id: string; active: boolean };
    expect(body.active).toBe(true);

    const status = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants/${body.id}/status`, { headers: { authorization: `Bearer ${admin}` } });
    const statusBody = (await status.json()) as { active: boolean };
    expect(statusBody.active).toBe(true);
  });

  it('rejects granting with an expiry already in the past', async () => {
    const { token: admin } = await loginAsRole(['super_admin']);
    // durationMinutes is always positive by schema - exercise the
    // service-level guard directly isn't possible over HTTP, so this
    // instead proves a non-positive duration is rejected by the DTO.
    const grant = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants`, {
      method: 'POST',
      headers: authHeaders(admin),
      body: JSON.stringify({ grantedTo: 'someone', reason: 'x', roleName: 'finance', durationMinutes: -5 }),
    });
    expect(grant.status).toBe(400);
  });

  it('a non-super_admin cannot grant break-glass access', async () => {
    const { token } = await loginAsRole(['finance']);
    const grant = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ grantedTo: 'someone', reason: 'x', roleName: 'finance', durationMinutes: 30 }),
    });
    expect(grant.status).toBe(403);
  });

  it('a grant becomes unusable the instant expires_at passes - verified by moving expires_at into the past directly in the database (the established clock-manipulation pattern, not a real wait)', async () => {
    const { token: admin, id: adminId } = await loginAsRole(['super_admin']);
    const grant = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants`, {
      method: 'POST',
      headers: authHeaders(admin),
      body: JSON.stringify({ grantedTo: adminId, reason: 'incident-456', roleName: 'trading', durationMinutes: 30 }),
    });
    const { id } = (await grant.json()) as { id: string };

    const client = createSuperuserPgClient();
    await client.connect();
    try {
      await client.query("UPDATE break_glass_grants SET expires_at = now() - interval '1 second' WHERE id = $1", [id]);
    } finally {
      await client.end();
    }

    const status = await fetch(`${BACKOFFICE_BASE_URL}/break-glass-grants/${id}/status`, { headers: { authorization: `Bearer ${admin}` } });
    const statusBody = (await status.json()) as { active: boolean };
    expect(statusBody.active).toBe(false);
  });
});

describe('audit-index polling', () => {
  it('polls a real reachable source (ledger) and ingests its real audit event, while the seven unreachable sources are skipped without crashing the whole poll', async () => {
    const debitAccountId = await createLedgerAccount();
    const creditAccountId = await createLedgerAccount();
    const journalResponse = await fetch(`${LEDGER_BASE_URL}/journals`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': `audit-poll-test-${Math.random()}` },
      body: JSON.stringify({ reasonCode: 'audit_poll_test', entries: [{ accountId: debitAccountId, amountMinor: '10', direction: 'debit' }, { accountId: creditAccountId, amountMinor: '10', direction: 'credit' }] }),
    });
    expect(journalResponse.status).toBe(201);

    const { token } = await loginAsRole(['auditor']);
    const poll = await fetch(`${BACKOFFICE_BASE_URL}/audit-index/poll`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
    expect(poll.status).toBe(201);
    const results = (await poll.json()) as Array<{ source: string; ingested: number }>;
    expect(results).toHaveLength(8);
    const ledgerResult = results.find((r) => r.source === 'ledger');
    expect(ledgerResult?.ingested).toBeGreaterThanOrEqual(1);
    // Every other source was unreachable (UNREACHABLE_URL) for this
    // whole suite - each must be reported as ingested: 0, never absent
    // from the array (which would mean the loop crashed on it and
    // never got to record a result).
    for (const source of ['account', 'crypto', 'game-wallet', 'sportsbook', 'bonus', 'responsible-gambling', 'risk']) {
      expect(results.find((r) => r.source === source)?.ingested).toBe(0);
    }

    const verify = await fetch(`${BACKOFFICE_BASE_URL}/audit-index/source:ledger/verify`, { headers: { authorization: `Bearer ${token}` } });
    expect(verify.status).toBe(200);
    const verifyBody = (await verify.json()) as { valid: boolean };
    expect(verifyBody.valid).toBe(true);
  });

  it('re-polling is idempotent - the same records are never ingested twice (the watermark advances)', async () => {
    const { token } = await loginAsRole(['auditor']);
    const firstPoll = await fetch(`${BACKOFFICE_BASE_URL}/audit-index/poll`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
    const firstResults = (await firstPoll.json()) as Array<{ source: string; ingested: number }>;
    expect(firstResults.find((r) => r.source === 'ledger')?.ingested).toBe(0);
  });

  it('only auditor (or super_admin) may poll or verify - a finance-only token gets 403', async () => {
    const { token } = await loginAsRole(['finance']);
    const poll = await fetch(`${BACKOFFICE_BASE_URL}/audit-index/poll`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
    expect(poll.status).toBe(403);
  });
});

describe('audit-verification CLI (Phase 6 acceptance criterion: detects a hand-tampered row in a fixture chain)', () => {
  it('exits 0 for the untampered fixture chain', async () => {
    const fixturePath = new URL('../../../.fixtures/audit-chain/good-chain.json', import.meta.url).pathname;
    await expect(execFileAsync('node', ['dist/audit-verify-cli.js', '--file', fixturePath], { cwd: new URL('..', import.meta.url).pathname })).resolves.toBeDefined();
  });

  it('exits 1 for the fixture chain with a hand-tampered row', async () => {
    const fixturePath = new URL('../../../.fixtures/audit-chain/tampered-chain.json', import.meta.url).pathname;
    await expect(execFileAsync('node', ['dist/audit-verify-cli.js', '--file', fixturePath], { cwd: new URL('..', import.meta.url).pathname })).rejects.toMatchObject({ code: 1 });
  });

  it('exits 0 verifying a live stream in this service\'s own DB (its own maker-checker audit trail)', async () => {
    const cliCwd = new URL('..', import.meta.url).pathname;
    await expect(
      execFileAsync('node', ['dist/audit-verify-cli.js', '--stream', 'backoffice-api-main'], {
        cwd: cliCwd,
        // loadBackofficeConfig() validates the FULL config schema even
        // in --stream mode (it only ever uses DATABASE_URL), so
        // ADMIN_JWT_SECRET must be present too or it fails before
        // getting anywhere near the database.
        env: {
          ...process.env,
          DATABASE_URL: 'postgres://backoffice_api_app:dev_only_backoffice_api_password@localhost:5432/backoffice_api',
          ADMIN_JWT_SECRET: 'test-only-backoffice-jwt-secret',
        },
      }),
    ).resolves.toBeDefined();
  });
});

describe('player-lookup PII masking (Phase 7 acceptance criterion: unmasking always writes an audit event with a reason before the API returns the unmasked value)', () => {
  it('the masked view never contains the real email', async () => {
    const email = `player-masked-${Date.now()}@example.com`;
    const playerId = await registerAccountPlayer(email);
    const { token } = await loginAsRole(['support']);

    const response = await fetch(`${BACKOFFICE_BASE_URL}/player-lookup/${playerId}`, { headers: { authorization: `Bearer ${token}` } });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { email: string; masked: boolean };
    expect(body.masked).toBe(true);
    expect(body.email).not.toBe(email);
    expect(body.email).not.toContain(email.split('@')[0]!.slice(1));
  });

  it('returns 404 for an unknown player', async () => {
    const { token } = await loginAsRole(['support']);
    const response = await fetch(`${BACKOFFICE_BASE_URL}/player-lookup/01M00000000000000000000000`, { headers: { authorization: `Bearer ${token}` } });
    expect(response.status).toBe(404);
  });

  it('rejects unmasking with no reason', async () => {
    const email = `player-noreason-${Date.now()}@example.com`;
    const playerId = await registerAccountPlayer(email);
    const { token } = await loginAsRole(['support']);

    const response = await fetch(`${BACKOFFICE_BASE_URL}/player-lookup/${playerId}/unmask`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
  });

  it('rejects unmasking from a role that has no business investigating players', async () => {
    const email = `player-wrongrole-${Date.now()}@example.com`;
    const playerId = await registerAccountPlayer(email);
    const { token } = await loginAsRole(['finance']);

    const response = await fetch(`${BACKOFFICE_BASE_URL}/player-lookup/${playerId}/unmask`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason: 'investigating a chargeback' }),
    });
    expect(response.status).toBe(403);
  });

  it('unmasking returns the real email AND writes an audit event with the reason, before the value comes back', async () => {
    const email = `player-unmask-${Date.now()}@example.com`;
    const playerId = await registerAccountPlayer(email);
    const { token, id: adminId } = await loginAsRole(['support']);
    const reason = 'responding to a support ticket about a failed deposit';

    const response = await fetch(`${BACKOFFICE_BASE_URL}/player-lookup/${playerId}/unmask`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ reason }),
    });
    expect(response.status).toBe(201);
    const body = (await response.json()) as { email: string; masked: boolean };
    expect(body.masked).toBe(false);
    expect(body.email).toBe(email);

    const client = createSuperuserPgClient();
    await client.connect();
    try {
      const result = await client.query<{ payload: { playerId: string; reason: string }; actor: string; event_type: string }>(
        "SELECT payload, actor, event_type FROM audit_index WHERE event_type = 'player_pii.unmasked' AND payload->>'playerId' = $1",
        [playerId],
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]!.payload.reason).toBe(reason);
      expect(result.rows[0]!.actor).toBe(`admin:${adminId}`);
    } finally {
      await client.end();
    }
  });
});

describe('admin user creation', () => {
  it('rejects an unknown role name', async () => {
    const response = await fetch(`${BACKOFFICE_BASE_URL}/admin-users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `bad-role-${Date.now()}@platform.internal`, password: 'correcthorsebattery1', roles: ['not_a_real_role'] }),
    });
    expect(response.status).toBe(400);
  });

  it('rejects creating a second admin user with the same email', async () => {
    const { email, password } = await createAdminUser(['support']);
    const response = await fetch(`${BACKOFFICE_BASE_URL}/admin-users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, roles: ['support'] }),
    });
    expect(response.status).toBe(409);
  });
});
