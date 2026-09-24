import { ConflictError, UnauthenticatedError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';
import { verifyPlayerAccessToken, signPlayerAccessToken } from './jwt.js';
import { hashPassword, verifyPassword } from './password.js';

const PlayerId = defineId('PlayerId');
const PlayerSessionId = defineId('PlayerSessionId');

// Same "verify against a fixed dummy hash when the account doesn't
// exist" pattern as services/backoffice-api's AdminAuthService, so a
// login attempt against an unknown email takes the same time as one
// against a real email with a wrong password - no user-enumeration
// timing side-channel.
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$dGhpcyBpcyBhIGZha2Ugc2FsdA$V0/W0W1+3Q9x+7Z5X9m8XG2Q8V0W1+3Q9x+7Z5X9m8X';

export interface RegisterPlayerInput {
  email: string;
  password: string;
  username?: string | undefined;
}

export interface PlayerAuthResult {
  accessToken: string;
  playerId: string;
}

export class PlayerAuthService {
  constructor(
    private readonly db: Kysely<Database>,
    private readonly config: { jwtSecret: string; accessTokenTtlSeconds: number },
  ) {}

  async register(input: RegisterPlayerInput): Promise<PlayerAuthResult> {
    const existing = await this.db.selectFrom('players').select('id').where('email', '=', input.email.toLowerCase()).executeTakeFirst();
    if (existing) {
      throw new ConflictError(`An account with email ${input.email} already exists`);
    }

    const id = PlayerId.generate();
    const passwordHash = await hashPassword(input.password);
    await this.db
      .insertInto('players')
      .values({
        id,
        username: input.username ?? null,
        email: input.email.toLowerCase(),
        password_hash: passwordHash,
        currency: 'USD',
        status: 'ACTIVE',
        vip_level: 'BRONZE',
      })
      .execute();

    return this.startSession(id);
  }

  async login(email: string, password: string, ip?: string | undefined): Promise<PlayerAuthResult> {
    const player = await this.db.selectFrom('players').selectAll().where('email', '=', email.toLowerCase()).executeTakeFirst();

    const passwordOk = await verifyPassword(player?.password_hash ?? DUMMY_PASSWORD_HASH, password);
    if (!player || !passwordOk || player.status !== 'ACTIVE') {
      throw new UnauthenticatedError('Invalid email or password');
    }

    if (ip) {
      await this.db.updateTable('players').set({ last_login_at: new Date(), last_login_ip: ip }).where('id', '=', player.id).execute();
    }

    return this.startSession(player.id);
  }

  async logout(sessionId: string): Promise<void> {
    await this.db.updateTable('player_sessions').set({ revoked_at: new Date() }).where('id', '=', sessionId).where('revoked_at', 'is', null).execute();
  }

  async verifyToken(token: string) {
    const claims = await verifyPlayerAccessToken(token, this.config.jwtSecret);
    const session = await this.db
      .selectFrom('player_sessions')
      .select(['expires_at', 'revoked_at'])
      .where('id', '=', claims.sessionId)
      .executeTakeFirst();

    if (!session || session.revoked_at !== null || session.expires_at.getTime() < Date.now()) {
      throw new UnauthenticatedError('Session is no longer valid');
    }

    return claims;
  }

  private async startSession(playerId: string): Promise<PlayerAuthResult> {
    const sessionId = PlayerSessionId.generate();
    const expiresAt = new Date(Date.now() + this.config.accessTokenTtlSeconds * 1000);
    await this.db.insertInto('player_sessions').values({ id: sessionId, player_id: playerId, expires_at: expiresAt }).execute();

    const accessToken = await signPlayerAccessToken({ playerId, sessionId }, this.config.jwtSecret, this.config.accessTokenTtlSeconds);
    return { accessToken, playerId };
  }
}
