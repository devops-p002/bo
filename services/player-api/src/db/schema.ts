import type { ColumnType } from 'kysely';

type TimestampColumn = ColumnType<Date, string | Date | undefined, string | Date>;
type NullableTimestampColumn = ColumnType<Date | null, string | Date | null | undefined, string | Date | null>;
type CreatedAtColumn = ColumnType<Date, string | Date | undefined, never>;

// Decimal columns round-trip through node-postgres as strings - see
// services/backoffice-api/src/db/schema.ts's identical comment (this
// file is a deliberate duplicate of the subset of the shared
// backoffice_api database this service actually touches, not an import
// of that one - same "no cross-service imports" rule services/backoffice-
// api's own jwt.ts documents).
type DecimalColumn = ColumnType<string, string | number | undefined, string | number>;

export type PlayerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';
export type PlayerVipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type SignupChannel = 'DIRECT' | 'AFFILIATE';

export interface PlayersTable {
  id: string;
  username: string | null;
  email: string;
  password_hash: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: ColumnType<Date | null, string | Date | null | undefined, string | Date | null>;
  country: string | null;
  currency: ColumnType<string, string | undefined, string>;
  status: ColumnType<PlayerStatus, PlayerStatus | undefined, PlayerStatus>;
  vip_level: ColumnType<PlayerVipLevel, PlayerVipLevel | undefined, PlayerVipLevel>;
  balance: DecimalColumn;
  bonus_balance: DecimalColumn;
  total_deposits: DecimalColumn;
  total_withdrawals: DecimalColumn;
  total_bets: DecimalColumn;
  total_wins: DecimalColumn;
  last_login_at: NullableTimestampColumn;
  last_login_ip: string | null;
  last_login_country: string | null;
  last_login_user_agent: string | null;
  last_login_device: string | null;
  signup_channel: ColumnType<SignupChannel, SignupChannel | undefined, SignupChannel>;
  referral_code: string | null;
  created_at: CreatedAtColumn;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BONUS' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';

export interface TransactionsTable {
  id: string;
  player_id: string;
  type: ColumnType<TransactionType, TransactionType | undefined, TransactionType>;
  amount: DecimalColumn;
  currency: ColumnType<string, string | undefined, string>;
  status: ColumnType<TransactionStatus, TransactionStatus | undefined, TransactionStatus>;
  payment_method: string | null;
  external_reference: string | null;
  reason: string | null;
  created_at: CreatedAtColumn;
  updated_at: TimestampColumn;
}

export interface PlayerSessionsTable {
  id: string;
  player_id: string;
  created_at: CreatedAtColumn;
  expires_at: TimestampColumn;
  revoked_at: NullableTimestampColumn;
}

export interface PlayerDevicesTable {
  id: string;
  player_id: string;
  fingerprint: string;
  user_agent: string | null;
  ip_address: string | null;
  first_seen_at: CreatedAtColumn;
  last_seen_at: TimestampColumn;
  login_count: ColumnType<number, number | undefined, number>;
}

export type GameCategory = 'SLOTS' | 'LIVE_CASINO' | 'GAME_SHOWS' | 'TABLE_GAMES' | 'ORIGINALS';

export interface GamesTable {
  id: string;
  name: string;
  category: ColumnType<GameCategory, GameCategory | undefined, GameCategory>;
  provider: string;
  thumbnail_url: string | null;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  created_at: CreatedAtColumn;
}

export interface Database {
  players: PlayersTable;
  transactions: TransactionsTable;
  player_sessions: PlayerSessionsTable;
  player_devices: PlayerDevicesTable;
  games: GamesTable;
}
