import { Body, Controller, Get, Inject, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { PLAYER_API_CONFIG } from '../config.js';
import type { PlayerApiConfig } from '../config.js';
import { PlayerAuthService } from '../player-auth.service.js';
import { WalletService } from '../wallet.service.js';
import type { LoginDto, RegisterDto, UpdateProfileDto } from './dto.js';
import { loginSchema, registerSchema, updateProfileSchema } from './dto.js';
import type { AuthenticatedPlayerRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { SESSION_COOKIE_NAME } from './tokens.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly playerAuth: PlayerAuthService,
    private readonly wallet: WalletService,
    @Inject(PLAYER_API_CONFIG) private readonly config: PlayerApiConfig,
  ) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.playerAuth.register(body, req.ip, req.headers['user-agent']);
    this.setSessionCookie(reply, result.accessToken);
    return { playerId: result.playerId };
  }

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const result = await this.playerAuth.login(body.email, body.password, req.ip, req.headers['user-agent']);
    this.setSessionCookie(reply, result.accessToken);
    return { playerId: result.playerId };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthenticatedPlayerRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    if (req.sessionId) {
      await this.playerAuth.logout(req.sessionId);
    }
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedPlayerRequest) {
    return this.wallet.getWallet(req.playerId!);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: AuthenticatedPlayerRequest, @Body(new ZodValidationPipe(updateProfileSchema)) body: UpdateProfileDto) {
    return this.wallet.updateProfile(req.playerId!, body);
  }

  private setSessionCookie(reply: FastifyReply, accessToken: string) {
    // httpOnly so apps/player-web's own JS can never read the token -
    // same XSS-defense rationale as backoffice-api's admin cookie.
    // SameSite=None;Secure because the frontend and this API are
    // different subdomains.
    reply.setCookie(SESSION_COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: this.config.PLAYER_ACCESS_TOKEN_TTL_SECONDS,
    });
  }
}
