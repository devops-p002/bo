import { appendEvent } from '@platform/audit-chain';
import type { AuditChainStore } from '@platform/audit-chain';
import { ConflictError, UnauthenticatedError, ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';
import { verifyAdminAccessToken, signAdminAccessToken } from './jwt.js';
import { hashPassword, verifyPassword } from './password.js';
import type { Role } from './roles.js';
import { ROLES } from './roles.js';

const AdminUserId = defineId('AdminUserId');
const AUDIT_STREAM_ID = 'backoffice-api-main';

// Same "verify against a fixed dummy hash when the account doesn't
// exist" pattern as services/account, so a login attempt against an
// unknown email takes the same time as one against a real email with
// a wrong password - no user-enumeration timing side-channel.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dGhpcyBpcyBhIGZha2Ugc2FsdA$V0/W0W1+3Q9x+7Z5X9m8XG2Q8V0W1+3Q9x+7Z5X9m8X';

export interface CreateAdminUserInput {
  email: string;
  password: string;
  roles: Role[];
}

export interface AdminLoginResult {
  accessToken: string;
  adminUserId: string;
  roles: string[];
}

export class AdminAuthService {
  constructor(
    private readonly db: Kysely<Database>,
    private readonly auditStore: AuditChainStore,
    private readonly config: { jwtSecret: string; accessTokenTtlSeconds: number },
  ) {}

  async createAdminUser(input: CreateAdminUserInput): Promise<{ id: string }> {
    for (const role of input.roles) {
      if (!ROLES.includes(role)) {
        throw new ValidationError(`Unknown role "${role}"`);
      }
    }

    const existing = await this.db.selectFrom('admin_users').select('id').where('email', '=', input.email.toLowerCase()).executeTakeFirst();
    if (existing) {
      throw new ConflictError(`An admin user with email ${input.email} already exists`);
    }

    const id = AdminUserId.generate();
    const passwordHash = await hashPassword(input.password);

    await this.db
      .insertInto('admin_users')
      .values({ id, email: input.email.toLowerCase(), password_hash: passwordHash, status: 'active' })
      .execute();

    const roleRows = await this.db.selectFrom('admin_roles').select(['id', 'name']).where('name', 'in', input.roles).execute();
    if (roleRows.length > 0) {
      await this.db.insertInto('role_assignments').values(roleRows.map((r) => ({ admin_user_id: id, role_id: r.id }))).execute();
    }

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'admin.created',
      occurredAt: new Date().toISOString(),
      actor: `admin:${id}`,
      payload: { email: input.email.toLowerCase(), roles: input.roles },
    });

    return { id };
  }

  async login(email: string, password: string): Promise<AdminLoginResult> {
    const user = await this.db.selectFrom('admin_users').selectAll().where('email', '=', email.toLowerCase()).executeTakeFirst();

    const passwordOk = await verifyPassword(user?.password_hash ?? DUMMY_PASSWORD_HASH, password);
    if (!user || !passwordOk || user.status !== 'active') {
      throw new UnauthenticatedError('Invalid email or password');
    }

    const roleRows = await this.db
      .selectFrom('role_assignments')
      .innerJoin('admin_roles', 'admin_roles.id', 'role_assignments.role_id')
      .select('admin_roles.name')
      .where('role_assignments.admin_user_id', '=', user.id)
      .execute();
    const roles = roleRows.map((r) => r.name);

    const accessToken = await signAdminAccessToken({ adminUserId: user.id, roles }, this.config.jwtSecret, this.config.accessTokenTtlSeconds);

    await appendEvent(this.auditStore, AUDIT_STREAM_ID, {
      eventType: 'admin.login_succeeded',
      occurredAt: new Date().toISOString(),
      actor: `admin:${user.id}`,
      payload: { email: user.email },
    });

    return { accessToken, adminUserId: user.id, roles };
  }

  async verifyToken(token: string) {
    return verifyAdminAccessToken(token, this.config.jwtSecret);
  }
}
