import { ConflictError, UnauthenticatedError } from '@platform/errors';
import { defineId } from '@platform/ids';
import { sql } from 'kysely';
import type { Kysely } from 'kysely';
import type { Database } from './db/schema.js';
import { verifyPlayerAccessToken, signPlayerAccessToken } from './jwt.js';
import { classifyDevice, lookupCountry } from './login-context.js';
import { hashPassword, verifyPassword } from './password.js';

const PlayerId = defineId('PlayerId');
const PlayerSessionId = defineId('PlayerSessionId');
const PlayerDeviceId = defineId('PlayerDeviceId');

// A real fingerprint (see apps/player-web/src/lib/fingerprint.ts) is a
// fixed-length SHA-256 hex digest (64 chars). Anything wildly longer is
// not a fingerprint this service generated a matching client for -
// dropped rather than stored, so a malicious/broken caller can't stuff
// arbitrary data into this column.
const MAX_FINGERPRINT_LENGTH = 128;

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
  referralCode?: string | undefined;
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

  async register(
    input: RegisterPlayerInput,
    ip?: string | undefined,
    userAgent?: string | undefined,
    fingerprint?: string | undefined,
  ): Promise<PlayerAuthResult> {
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
        // Real, mechanically-derived from the signup request itself - a
        // ?ref=<code> URL param apps/player-web's register page reads and
        // forwards, never a client self-assertion of "I'm affiliate
        // traffic". See the add-signup-channel migration's own comment.
        signup_channel: input.referralCode ? 'AFFILIATE' : 'DIRECT',
        referral_code: input.referralCode ?? null,
        ...this.buildLoginContext(ip, userAgent),
      })
      .execute();
    await this.recordDevice(id, fingerprint, ip, userAgent);

    return this.startSession(id);
  }

  async login(
    email: string,
    password: string,
    ip?: string | undefined,
    userAgent?: string | undefined,
    fingerprint?: string | undefined,
  ): Promise<PlayerAuthResult> {
    const player = await this.db.selectFrom('players').selectAll().where('email', '=', email.toLowerCase()).executeTakeFirst();

    const passwordOk = await verifyPassword(player?.password_hash ?? DUMMY_PASSWORD_HASH, password);
    if (!player || !passwordOk || player.status !== 'ACTIVE') {
      throw new UnauthenticatedError('Invalid email or password');
    }

    if (ip) {
      await this.db.updateTable('players').set(this.buildLoginContext(ip, userAgent)).where('id', '=', player.id).execute();
    }
    await this.recordDevice(player.id, fingerprint, ip, userAgent);

    return this.startSession(player.id);
  }

  // One row per (player, fingerprint) pair - see the create-player-devices
  // migration's own comment on why this is a separate table keyed by
  // fingerprint rather than another players column: it's what makes "which
  // other players share this device" a real query, not just "was this
  // login familiar". Silently skipped when the client sent no fingerprint
  // (an old cached session, a client that failed to compute one) or an
  // obviously-bogus one - this is an enrichment, never a login blocker.
  private async recordDevice(
    playerId: string,
    fingerprint: string | undefined,
    ip: string | undefined,
    userAgent: string | undefined,
  ): Promise<void> {
    if (!fingerprint || fingerprint.length === 0 || fingerprint.length > MAX_FINGERPRINT_LENGTH) return;

    await this.db
      .insertInto('player_devices')
      .values({
        id: PlayerDeviceId.generate(),
        player_id: playerId,
        fingerprint,
        user_agent: userAgent ?? null,
        ip_address: ip ?? null,
      })
      .onConflict((oc) =>
        oc.columns(['player_id', 'fingerprint']).doUpdateSet({
          last_seen_at: new Date(),
          login_count: sql`player_devices.login_count + 1`,
          user_agent: userAgent ?? null,
          ip_address: ip ?? null,
        }),
      )
      .execute();
  }

  // Shared by register (first login context a player ever has) and login
  // (refreshed on every subsequent one) - all of it server-captured, never
  // a client-supplied field. See login-context.ts's own comments on why
  // IP/UA are the only trustworthy inputs here.
  private buildLoginContext(ip: string | undefined, userAgent: string | undefined) {
    return {
      last_login_at: new Date(),
      last_login_ip: ip ?? null,
      last_login_country: lookupCountry(ip),
      last_login_user_agent: userAgent ?? null,
      last_login_device: classifyDevice(userAgent),
    };
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
