import { z } from 'zod';
import { ROLES } from '../roles.js';

const ACTION_TYPES = ['balance_adjustment', 'payout', 'manual_settlement', 'odds_override', 'limit_change', 'export'] as const;

export const createMakerCheckerRequestSchema = z.object({
  actionType: z.enum(ACTION_TYPES),
  payload: z.record(z.unknown()),
});
export type CreateMakerCheckerRequestDto = z.infer<typeof createMakerCheckerRequestSchema>;

export const resolveCaseItemSchema = z.object({
  notes: z.string().optional(),
});
export type ResolveCaseItemDto = z.infer<typeof resolveCaseItemSchema>;

export const grantBreakGlassSchema = z.object({
  grantedTo: z.string().min(1),
  reason: z.string().min(1),
  roleName: z.enum(ROLES),
  durationMinutes: z.number().int().positive(),
});
export type GrantBreakGlassDto = z.infer<typeof grantBreakGlassSchema>;

export const createAdminUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(ROLES)).min(1),
});
export type CreateAdminUserDto = z.infer<typeof createAdminUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;

export const unmaskPlayerSchema = z.object({
  reason: z.string().min(1),
});
export type UnmaskPlayerDto = z.infer<typeof unmaskPlayerSchema>;
