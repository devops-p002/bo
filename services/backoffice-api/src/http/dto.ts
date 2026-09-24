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
const SEARCH_TYPES = ['Normal', 'Advanced', 'Exact'] as const;
const SIGNUP_CHANNELS = ['DIRECT', 'AFFILIATE'] as const;

export const listPlayersQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  fullName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1).optional(),
  status: z.enum(PLAYER_STATUSES).optional(),
  vipLevel: z.enum(PLAYER_VIP_LEVELS).optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  lastLoginIP: z.string().trim().min(1).optional(),
  lastLoginSince: z.string().datetime().optional(),
  noLoginSince: z.string().datetime().optional(),
  lastDepositSince: z.string().datetime().optional(),
  lastBetTimeSince: z.string().datetime().optional(),
  dateOfBirthFrom: z.string().datetime().optional(),
  dateOfBirthTo: z.string().datetime().optional(),
  // Changes how `search` matches rather than what it matches against -
  // see players.service.ts's list() for the three real modes.
  searchType: z.enum(SEARCH_TYPES).optional(),
  currencyType: z.string().trim().length(3).optional(),
  channelType: z.enum(SIGNUP_CHANNELS).optional(),
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

const MEMBER_GROUP_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export const createMemberGroupSchema = z.object({
  name: z.string().trim().min(1).max(128),
  category: z.string().trim().min(1).optional(),
  status: z.enum(MEMBER_GROUP_STATUSES).optional(),
});
export type CreateMemberGroupDto = z.infer<typeof createMemberGroupSchema>;

export const updateMemberGroupSchema = z.object({
  name: z.string().trim().min(1).max(128).optional(),
  category: z.string().trim().min(1).optional(),
  status: z.enum(MEMBER_GROUP_STATUSES).optional(),
});
export type UpdateMemberGroupDto = z.infer<typeof updateMemberGroupSchema>;

export const addGroupMemberSchema = z.object({
  playerId: z.string().trim().min(1),
});
export type AddGroupMemberDto = z.infer<typeof addGroupMemberSchema>;

const BULK_OPERATION_TYPES = ['STATUS_CHANGE', 'VIP_LEVEL_UPDATE', 'BALANCE_ADJUSTMENT'] as const;

export const createBulkOperationSchema = z.object({
  operationType: z.enum(BULK_OPERATION_TYPES),
  playerIds: z.array(z.string().trim().min(1)).min(1),
  value: z.string().trim().min(1),
});
export type CreateBulkOperationDto = z.infer<typeof createBulkOperationSchema>;

const TRANSACTION_TYPES = ['DEPOSIT', 'WITHDRAWAL', 'BONUS', 'REFUND'] as const;
const TRANSACTION_STATUSES = ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED'] as const;

export const listTransactionsQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  status: z.enum(TRANSACTION_STATUSES).optional(),
  paymentMethod: z.string().trim().min(1).optional(),
  currency: z.string().trim().length(3).optional(),
  playerId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
});
export type ListTransactionsQueryDto = z.infer<typeof listTransactionsQuerySchema>;

export const createTransactionSchema = z.object({
  playerId: z.string().trim().min(1),
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().positive(),
  currency: z.string().trim().length(3).optional(),
  paymentMethod: z.string().trim().min(1).optional(),
  externalReference: z.string().trim().min(1).optional(),
});
export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

export const updateTransactionStatusSchema = z.object({
  status: z.enum(TRANSACTION_STATUSES),
  reason: z.string().trim().min(1).optional(),
});
export type UpdateTransactionStatusDto = z.infer<typeof updateTransactionStatusSchema>;

const GAME_CATEGORIES = ['SLOTS', 'LIVE_CASINO', 'GAME_SHOWS', 'TABLE_GAMES', 'ORIGINALS'] as const;
const BET_STATUSES = ['PENDING', 'SETTLED', 'PARTIALLY_SETTLED', 'CANCELLED', 'VOID'] as const;

export const listBetsQuerySchema = z.object({
  status: z.enum(BET_STATUSES).optional(),
  gameCategory: z.enum(GAME_CATEGORIES).optional(),
  playerId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minAmount: z.coerce.number().nonnegative().optional(),
  maxAmount: z.coerce.number().nonnegative().optional(),
  dateRangeStart: z.string().datetime().optional(),
  dateRangeEnd: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
});
export type ListBetsQueryDto = z.infer<typeof listBetsQuerySchema>;

export const updateBetStatusSchema = z.object({
  status: z.enum(BET_STATUSES),
  winAmount: z.number().nonnegative().optional(),
  result: z.unknown().optional(),
  voidReason: z.string().trim().min(1).optional(),
});
export type UpdateBetStatusDto = z.infer<typeof updateBetStatusSchema>;

export const listGamesQuerySchema = z.object({
  category: z.enum(GAME_CATEGORIES).optional(),
});
export type ListGamesQueryDto = z.infer<typeof listGamesQuerySchema>;

export const updateGameLimitsSchema = z.object({
  minBet: z.number().nonnegative().optional(),
  maxBet: z.number().nonnegative().optional(),
  maxWin: z.number().nonnegative().optional(),
});
export type UpdateGameLimitsDto = z.infer<typeof updateGameLimitsSchema>;
