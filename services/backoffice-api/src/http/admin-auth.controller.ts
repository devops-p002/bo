import { Body, Controller, Inject, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AdminAuthService } from '../admin-auth.service.js';
import { BACKOFFICE_CONFIG } from '../config.js';
import type { BackofficeConfig } from '../config.js';
import type { CreateAdminUserDto, LoginDto } from './dto.js';
import { createAdminUserSchema, loginSchema } from './dto.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { SESSION_COOKIE_NAME } from './tokens.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Admin-user creation is intentionally open here, the same "no auth,
 * trust the network boundary" posture as several other internal
 * endpoints in this platform (see services/bonus's templates
 * controller) - a real deployment puts this behind a separate,
 * break-glass-audited bootstrap process (Phase 7's back-office UI is
 * where day-to-day admin provisioning would actually live, gated by
 * RBAC once at least one super_admin exists). */
@Controller('admin-users')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post()
  async createAdminUser(@Body(new ZodValidationPipe(createAdminUserSchema)) body: CreateAdminUserDto) {
    return this.adminAuth.createAdminUser(body);
  }
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly adminAuth: AdminAuthService,
    @Inject(BACKOFFICE_CONFIG) private readonly config: BackofficeConfig,
  ) {}

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const result = await this.adminAuth.login(body.email, body.password);

    // httpOnly so apps/backoffice-web's own JS can never read the token
    // (defense against XSS exfiltrating it, the whole point of moving
    // off localStorage) - SameSite=None;Secure because the frontend
    // (back-office-admin.betqueen.live) and this API (api-back-office-admin.betqueen.live) are
    // different subdomains, which the browser treats as cross-site.
    reply.setCookie(SESSION_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: this.config.ADMIN_ACCESS_TOKEN_TTL_SECONDS,
    });

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedAdminRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    if (req.sessionId) {
      await this.adminAuth.logout(req.sessionId);
    }
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return { ok: true };
  }
}
