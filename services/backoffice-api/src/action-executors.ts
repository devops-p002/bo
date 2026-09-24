import { InternalError } from '@platform/errors';
import type { MakerCheckerActionType } from './db/schema.js';

export interface ActionExecutorConfig {
  ledgerBaseUrl: string;
  sportsbookBaseUrl: string;
  responsibleGamblingBaseUrl: string;
}

async function postJson(url: string, body: unknown, idempotencyKey?: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}) },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new InternalError(`downstream request to ${url} failed with status ${response.status}`, {
      detail: await response.text().catch(() => ''),
      meta: { status: response.status, url },
    });
  }
  return (await response.json()) as Record<string, unknown>;
}

async function patchJson(url: string, body: unknown): Promise<Record<string, unknown>> {
  const response = await fetch(url, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) {
    throw new InternalError(`downstream request to ${url} failed with status ${response.status}`, {
      detail: await response.text().catch(() => ''),
      meta: { status: response.status, url },
    });
  }
  return (await response.json()) as Record<string, unknown>;
}

/**
 * One executor per maker-checker action type - the real HTTP call
 * approving a request actually makes. Each reuses an endpoint that
 * already exists and is already tested in its owning service (ledger's
 * /journals, sportsbook's /bets/:id/settle and the new PATCH
 * /markets/:id, responsible-gambling's new POST /admin/limits) -
 * approval doesn't reimplement any business logic, it only decides
 * *whether* the call happens (see MakerCheckerService.approve).
 * `export` is the one action type with no downstream call: "executing"
 * it just means the export is now authorized to run, which is itself
 * the whole point of gating it behind maker-checker.
 */
export function createActionExecutors(config: ActionExecutorConfig): Record<MakerCheckerActionType, (requestId: string, payload: Record<string, unknown>) => Promise<Record<string, unknown>>> {
  return {
    balance_adjustment: (requestId, payload) =>
      postJson(
        `${config.ledgerBaseUrl}/journals`,
        {
          reasonCode: 'backoffice_balance_adjustment',
          entries: [
            { accountId: payload.debitAccountId, amountMinor: payload.amountMinor, direction: 'debit' },
            { accountId: payload.creditAccountId, amountMinor: payload.amountMinor, direction: 'credit' },
          ],
        },
        `backoffice:${requestId}`,
      ),

    payout: (requestId, payload) =>
      postJson(
        `${config.ledgerBaseUrl}/journals`,
        {
          reasonCode: 'backoffice_payout',
          entries: [
            { accountId: payload.houseAccountId, amountMinor: payload.amountMinor, direction: 'debit' },
            { accountId: payload.playerAccountId, amountMinor: payload.amountMinor, direction: 'credit' },
          ],
        },
        `backoffice:${requestId}`,
      ),

    manual_settlement: (_requestId, payload) =>
      postJson(`${config.sportsbookBaseUrl}/bets/${payload.betId}/settle`, {
        outcome: payload.outcome,
        ...(payload.payoutMinor === undefined ? {} : { payoutMinor: payload.payoutMinor }),
      }),

    odds_override: (_requestId, payload) =>
      patchJson(`${config.sportsbookBaseUrl}/markets/${payload.marketId}`, {
        ...(payload.oddsMillis === undefined ? {} : { oddsMillis: payload.oddsMillis }),
        ...(payload.status === undefined ? {} : { status: payload.status }),
      }),

    limit_change: (requestId, payload) =>
      postJson(`${config.responsibleGamblingBaseUrl}/admin/limits`, {
        playerId: payload.playerId,
        limitType: payload.limitType,
        period: payload.period,
        amountMinor: payload.amountMinor,
        idempotencyKey: `backoffice:${requestId}`,
      }),

    export: (requestId) => Promise.resolve({ status: 'ready', requestId }),
  };
}
