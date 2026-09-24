import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  username: z.string().trim().min(3).max(64).optional(),
  // Read off a `?ref=<code>` URL param at signup (see apps/player-web's
  // register page) - a real affiliate-link parameter, not a client
  // self-assertion of "I'm affiliate traffic". Presence/absence is what
  // PlayerAuthService.register derives signup_channel from.
  referralCode: z.string().trim().min(1).max(64).optional(),
});
export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});
export type LoginDto = z.infer<typeof loginSchema>;

// Registration stays email+username+password only (light signup) -
// profile fields are filled in later, here, via the player's own
// "Complete your profile" page.
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().min(1).max(32).optional(),
  dateOfBirth: z.string().date().optional(),
  country: z.string().trim().length(2).optional(),
});
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const requestTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().trim().length(3).optional(),
  paymentMethod: z.string().trim().min(1).optional(),
});
export type RequestTransactionDto = z.infer<typeof requestTransactionSchema>;

export const listTransactionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ListTransactionsQueryDto = z.infer<typeof listTransactionsQuerySchema>;

const GAME_CATEGORIES = ['SLOTS', 'LIVE_CASINO', 'GAME_SHOWS', 'TABLE_GAMES', 'ORIGINALS'] as const;

export const listGamesQuerySchema = z.object({
  category: z.enum(GAME_CATEGORIES).optional(),
});
export type ListGamesQueryDto = z.infer<typeof listGamesQuerySchema>;
