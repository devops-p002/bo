import { appendEvent } from '@platform/audit-chain';
import type { AuditChainStore } from '@platform/audit-chain';
import { ConflictError, NotFoundError, PermissionDeniedError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { ActionExecutorConfig } from './action-executors.js';
import { createActionExecutors } from './action-executors.js';
import type { Database, MakerCheckerActionType, MakerCheckerStatus } from './db/schema.js';
import { canActOnActionType } from './roles.js';
import type { CaseQueueService } from './case-queue.service.js';

const MakerCheckerRequestId = defineId('MakerCheckerRequestId');
const AUDIT_STREAM_ID = 'backoffice-api-main';

const PG_CHECK_VIOLATION = '23514';
function isPgCheckViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === PG_CHECK_VIOLATION;
}

export interface CreateRequestInput {
  actionType: MakerCheckerActionType;
  payload: Record<string, unknown>;
  requestedBy: string;
  requesterRoles: readonly string[];
}

export interface MakerCheckerRequestResult {
  id: string;
  actionType: MakerCheckerActionType;
  payload: Record<string, unknown>;
  requestedBy: string;
  approvedBy: string | null;
  status: MakerCheckerStatus;
  executionResult: Record<string, unknown> | null;
}

function toResult(row: {
  id: string;
  action_type: MakerCheckerActionType;
  payload: unknown;
  requested_by: string;
  approved_by: string | null;
  status: MakerCheckerStatus;
  execution_result: unknown;
}): MakerCheckerRequestResult {
  return {
    id: row.id,
    actionType: row.action_type,
    payload: row.payload as Record<string, unknown>,
    requestedBy: row.requested_by,
    approvedBy: row.approved_by,
    status: row.status,
    executionResult: (row.execution_result as Record<string, unknown> | null) ?? null,
  };
}

export class MakerCheckerService {
  private readonly executors: ReturnType<typeof createActionExecutors>;

  constructor(
    private readonly db: Kysely<Database>,
    private readonly auditStore: AuditChainStore,
    executorConfig: ActionExecutorConfig,
    private readonly caseQueue: CaseQueueService,
  ) {
    this.executors = createActionExecutors(executorConfig);
  }

  async createRequest(input: CreateRequestInput): Promise<MakerCheckerRequestResult> {
    if (!canActOnActionType(input.requesterRoles, input.actionType)) {
      throw new PermissionDeniedError(`Not permitted to request a "${input.actionType}" action`);
    }

    const id = MakerCheckerRequestId.generate();
    await this.db
      .insertInto('maker_checker_requests')
      .values({
        id,
        action_type: input.actionType,
        payload: JSON.stringify(input.payload),
        requested_by: input.requestedBy,
        approved_by: null,
        status: 'pending',
        execution_result: null,
      })
      .execute();

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'maker_checker.requested',
      occurredAt: new Date().toISOString(),
      actor: `admin:${input.requestedBy}`,
      payload: { requestId: id, actionType: input.actionType },
    });

    // Every request gets a case queue item so an approver can find it
    // through the case-queue view, not just by knowing its id.
    await this.caseQueue.createItem('maker_checker', id);

    return { id, actionType: input.actionType, payload: input.payload, requestedBy: input.requestedBy, approvedBy: null, status: 'pending', executionResult: null };
  }

  async getRequest(id: string): Promise<MakerCheckerRequestResult> {
    const row = await this.db.selectFrom('maker_checker_requests').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`Unknown maker-checker request ${id}`);
    return toResult(row);
  }

  async listRequests(): Promise<MakerCheckerRequestResult[]> {
    const rows = await this.db.selectFrom('maker_checker_requests').selectAll().orderBy('created_at', 'desc').execute();
    return rows.map(toResult);
  }

  /**
   * Approves a pending request and executes its underlying action.
   * `requested_by <> approved_by` is enforced by the table's CHECK
   * constraint (see the migration's own comment) - this UPDATE is the
   * only place that column is ever written, and a self-approval
   * attempt fails at the database, not because this code happened to
   * remember to check first. Execution failure doesn't throw past this
   * call - it's recorded as `execution_failed` with the error message,
   * so an admin can see exactly what happened rather than getting a
   * bare 500.
   */
  async approve(id: string, approvedBy: string, approverRoles: readonly string[]): Promise<MakerCheckerRequestResult> {
    const request = await this.getRequest(id);
    if (request.status !== 'pending') {
      throw new ConflictError(`Request ${id} is not pending (status: ${request.status})`);
    }
    if (!canActOnActionType(approverRoles, request.actionType)) {
      throw new PermissionDeniedError(`Not permitted to approve a "${request.actionType}" action`);
    }

    const decidedAt = new Date();
    try {
      await this.db
        .updateTable('maker_checker_requests')
        .set({ approved_by: approvedBy, status: 'approved', decided_at: decidedAt })
        .where('id', '=', id)
        .where('status', '=', 'pending')
        .execute();
    } catch (err) {
      if (isPgCheckViolation(err)) {
        throw new PermissionDeniedError('An admin user may not approve their own request');
      }
      throw err;
    }

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'maker_checker.approved',
      occurredAt: decidedAt.toISOString(),
      actor: `admin:${approvedBy}`,
      payload: { requestId: id, actionType: request.actionType, requestedBy: request.requestedBy },
    });
    await this.caseQueue.resolveByReference(id, approvedBy);

    try {
      const executor = this.executors[request.actionType];
      const result = await executor(id, request.payload);
      await this.db.updateTable('maker_checker_requests').set({ status: 'executed', execution_result: JSON.stringify(result) }).where('id', '=', id).execute();

      await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
        eventType: 'maker_checker.executed',
        occurredAt: new Date().toISOString(),
        actor: `admin:${approvedBy}`,
        payload: { requestId: id, actionType: request.actionType },
      });

      return { ...request, approvedBy, status: 'executed', executionResult: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.db
        .updateTable('maker_checker_requests')
        .set({ status: 'execution_failed', execution_result: JSON.stringify({ error: message }) })
        .where('id', '=', id)
        .execute();

      await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
        eventType: 'maker_checker.execution_failed',
        occurredAt: new Date().toISOString(),
        actor: `admin:${approvedBy}`,
        payload: { requestId: id, actionType: request.actionType, error: message },
      });

      return { ...request, approvedBy, status: 'execution_failed', executionResult: { error: message } };
    }
  }

  async reject(id: string, decidedBy: string, deciderRoles: readonly string[]): Promise<MakerCheckerRequestResult> {
    const request = await this.getRequest(id);
    if (request.status !== 'pending') {
      throw new ConflictError(`Request ${id} is not pending (status: ${request.status})`);
    }
    if (!canActOnActionType(deciderRoles, request.actionType)) {
      throw new PermissionDeniedError(`Not permitted to reject a "${request.actionType}" action`);
    }

    const decidedAt = new Date();
    try {
      await this.db
        .updateTable('maker_checker_requests')
        .set({ approved_by: decidedBy, status: 'rejected', decided_at: decidedAt })
        .where('id', '=', id)
        .where('status', '=', 'pending')
        .execute();
    } catch (err) {
      if (isPgCheckViolation(err)) {
        throw new PermissionDeniedError('An admin user may not reject their own request');
      }
      throw err;
    }

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'maker_checker.rejected',
      occurredAt: decidedAt.toISOString(),
      actor: `admin:${decidedBy}`,
      payload: { requestId: id, actionType: request.actionType, requestedBy: request.requestedBy },
    });
    await this.caseQueue.resolveByReference(id, decidedBy);

    return { ...request, approvedBy: decidedBy, status: 'rejected', executionResult: null };
  }
}
