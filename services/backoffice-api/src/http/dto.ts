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

const PLAYER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING'] as const;
const PLAYER_VIP_LEVELS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'] as const;

export const listPlayersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  status: z.enum(PLAYER_STATUSES).optional(),
  vipLevel: z.enum(PLAYER_VIP_LEVELS).optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
});
export type ListPlayersQueryDto = z.infer<typeof listPlayersQuerySchema>;

export const createPlayerSchema = z.object({
  username: z.string().trim().min(3).max(64).optional(),
  email: z.string().trim().email(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  country: z.string().trim().min(1).optional(),
  currency: z.string().trim().length(3).optional(),
  vipLevel: z.enum(PLAYER_VIP_LEVELS).optional(),
});
export type CreatePlayerDto = z.infer<typeof createPlayerSchema>;

export const updatePlayerSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().datetime().optional(),
  vipLevel: z.enum(PLAYER_VIP_LEVELS).optional(),
  status: z.enum(PLAYER_STATUSES).optional(),
  phone: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
});
export type UpdatePlayerDto = z.infer<typeof updatePlayerSchema>;
