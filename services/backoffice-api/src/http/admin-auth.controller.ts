import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from '../admin-auth.service.js';
import type { CreateAdminUserDto, LoginDto } from './dto.js';
import { createAdminUserSchema, loginSchema } from './dto.js';
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
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return this.adminAuth.login(body.email, body.password);
  }
}
