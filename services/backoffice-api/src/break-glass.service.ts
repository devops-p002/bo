import { appendEvent } from '@platform/audit-chain';
import type { AuditChainStore } from '@platform/audit-chain';
import { NotFoundError, ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';

const BreakGlassGrantId = defineId('BreakGlassGrantId');
const AUDIT_STREAM_ID = 'backoffice-api-main';

export interface GrantBreakGlassInput {
  grantedTo: string;
  reason: string;
  roleName: string;
  reviewedBy: string;
  expiresAt: Date;
}

export interface BreakGlassStatus {
  id: string;
  grantedTo: string;
  roleName: string;
  active: boolean;
  expiresAt: string;
}

/**
 * A temporary elevation, always logged and always time-bounded. There
 * is no method here that extends, renews, or re-activates an existing
 * grant - a new need means a new grant (a new row, a new audit event),
 * never mutating one that's already expired. See isActive: it checks
 * `now() < expires_at` every time, so a grant becomes unusable the
 * instant its expiry passes with no separate revoke action needed
 * (PLAN.md Phase 6's acceptance criterion: "break-glass access expires
 * and is unusable one second past expires_at").
 */
export class BreakGlassService {
  constructor(
    private readonly db: Kysely<Database>,
    private readonly auditStore: AuditChainStore,
  ) {}

  async grant(input: GrantBreakGlassInput): Promise<BreakGlassStatus> {
    if (input.expiresAt.getTime() <= Date.now()) {
      throw new ValidationError('expiresAt must be in the future');
    }

    const id = BreakGlassGrantId.generate();
    await this.db
      .insertInto('break_glass_grants')
      .values({ id, granted_to: input.grantedTo, reason: input.reason, role_name: input.roleName, reviewed_by: input.reviewedBy, expires_at: input.expiresAt })
      .execute();

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'break_glass.granted',
      occurredAt: new Date().toISOString(),
      actor: `admin:${input.reviewedBy}`,
      payload: { grantId: id, grantedTo: input.grantedTo, roleName: input.roleName, reason: input.reason, expiresAt: input.expiresAt.toISOString() },
    });

    return { id, grantedTo: input.grantedTo, roleName: input.roleName, active: true, expiresAt: input.expiresAt.toISOString() };
  }

  async getStatus(id: string): Promise<BreakGlassStatus> {
    const row = await this.db.selectFrom('break_glass_grants').selectAll().where('id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundError(`Unknown break-glass grant ${id}`);

    return {
      id: row.id,
      grantedTo: row.granted_to,
      roleName: row.role_name,
      active: new Date(row.expires_at).getTime() > Date.now(),
      expiresAt: new Date(row.expires_at).toISOString(),
    };
  }

  /** Every currently-active grant's extra role for a given admin user -
   * what a real RBAC check would fold into that user's effective roles
   * for the duration of the grant. */
  async activeGrantedRoles(adminUserId: string): Promise<string[]> {
    const rows = await this.db
      .selectFrom('break_glass_grants')
      .select('role_name')
      .where('granted_to', '=', adminUserId)
      .where('expires_at', '>', new Date())
      .execute();
    return rows.map((r) => r.role_name);
  }
}
