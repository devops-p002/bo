import type { ColumnType } from 'kysely';

type TimestampColumn = ColumnType<Date, string | Date | undefined, string | Date>;
type NullableTimestampColumn = ColumnType<Date | null, string | Date | null | undefined, string | Date | null>;
type CreatedAtColumn = ColumnType<Date, string | Date | undefined, never>;

export type MakerCheckerActionType = 'balance_adjustment' | 'payout' | 'manual_settlement' | 'odds_override' | 'limit_change' | 'export';
export type MakerCheckerStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'execution_failed';

export interface AdminUsersTable {
  id: string;
  email: string;
  password_hash: string;
  status: 'active' | 'disabled';
  created_at: CreatedAtColumn;
}

export interface AdminRolesTable {
  id: string;
  name: string;
}

export interface AdminSessionsTable {
  id: string;
  admin_user_id: string;
  created_at: CreatedAtColumn;
  expires_at: TimestampColumn;
  revoked_at: NullableTimestampColumn;
}

export interface RoleAssignmentsTable {
  admin_user_id: string;
  role_id: string;
  assigned_at: CreatedAtColumn;
}

export interface MakerCheckerRequestsTable {
  id: string;
  action_type: MakerCheckerActionType;
  payload: ColumnType<Record<string, unknown>, unknown, unknown>;
  requested_by: string;
  approved_by: string | null;
  status: MakerCheckerStatus;
  execution_result: ColumnType<Record<string, unknown> | null, unknown, unknown>;
  created_at: CreatedAtColumn;
  decided_at: NullableTimestampColumn;
}

export interface CaseQueueItemsTable {
  id: string;
  queue_type: 'maker_checker' | 'risk_review' | 'kyc_review';
  reference_id: string;
  status: 'open' | 'resolved';
  assigned_to: string | null;
  resolved_by: string | null;
  notes: string | null;
  created_at: CreatedAtColumn;
  resolved_at: NullableTimestampColumn;
}

export interface BreakGlassGrantsTable {
  id: string;
  granted_to: string;
  reason: string;
  role_name: string;
  reviewed_by: string;
  granted_at: CreatedAtColumn;
  expires_at: TimestampColumn;
}

export interface AuditIndexTable {
  id: string;
  stream_id: string;
  prev_hash: string;
  hash: string;
  event_type: string;
  occurred_at: ColumnType<Date, string | Date, never>;
  actor: string;
  payload: ColumnType<unknown, unknown, never>;
  source_service: string | null;
  source_event_id: string | null;
  created_at: CreatedAtColumn;
}

export interface AuditIndexWatermarksTable {
  source_service: string;
  last_ingested_record_id: string | null;
  updated_at: TimestampColumn;
}

export type PlayerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';
export type PlayerVipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

// Decimal columns round-trip through node-postgres as strings (no lossy
// float parsing) - Kysely's insert/update side accepts either a string
// or number, but every read comes back as a string; PlayersService is
// responsible for converting to a number at the HTTP boundary.
type DecimalColumn = ColumnType<string, string | number | undefined, string | number>;

export interface PlayersTable {
  id: string;
  username: string | null;
  email: string;
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
  created_at: CreatedAtColumn;
}

export type MemberGroupStatus = 'ACTIVE' | 'INACTIVE';

export interface MemberGroupsTable {
  id: string;
  name: string;
  category: string | null;
  status: ColumnType<MemberGroupStatus, MemberGroupStatus | undefined, MemberGroupStatus>;
  created_at: CreatedAtColumn;
}

export interface MemberGroupMembersTable {
  group_id: string;
  player_id: string;
  added_at: CreatedAtColumn;
}

// Read-only here (backoffice_api_app only has SELECT - see the
// create-player-devices migration; services/player-api owns writing to
// it). One row per (player, fingerprint) pair - see that migration's
// comment on why this is indexed on fingerprint rather than being just
// another players column.
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

export type BulkOperationType = 'STATUS_CHANGE' | 'VIP_LEVEL_UPDATE' | 'BALANCE_ADJUSTMENT';
export type BulkOperationStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface BulkOperationsTable {
  id: string;
  operation_type: BulkOperationType;
  value: string;
  affected_count: ColumnType<number, number | undefined, number>;
  status: ColumnType<BulkOperationStatus, BulkOperationStatus | undefined, BulkOperationStatus>;
  error_message: string | null;
  created_by: string;
  created_at: CreatedAtColumn;
  completed_at: NullableTimestampColumn;
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

export type GameCategory = 'SLOTS' | 'LIVE_CASINO' | 'GAME_SHOWS' | 'TABLE_GAMES' | 'ORIGINALS';

// Owned by the games migration (created for apps/player-web's catalog,
// GRANT SELECT to backoffice_api_app there; min/max_bet/win added later,
// GRANT UPDATE scoped to just those three columns - see that migration).
// Only the fields the Bets section's "Bet Limits" tab needs are modeled
// here; full CMS CRUD (create/delete/thumbnail/etc, CLAUDE.md phase 7) is
// a separate, not-yet-built phase.
export interface GamesTable {
  id: string;
  name: string;
  category: ColumnType<GameCategory, GameCategory | undefined, GameCategory>;
  provider: ColumnType<string, string | undefined, string>;
  is_active: ColumnType<boolean, boolean | undefined, boolean>;
  min_bet: DecimalColumn | null;
  max_bet: DecimalColumn | null;
  max_win: DecimalColumn | null;
  created_at: CreatedAtColumn;
}

export type BetStatus = 'PENDING' | 'SETTLED' | 'PARTIALLY_SETTLED' | 'CANCELLED' | 'VOID';

export interface BetsTable {
  id: string;
  player_id: string;
  game_id: string;
  type: string;
  status: ColumnType<BetStatus, BetStatus | undefined, BetStatus>;
  amount: DecimalColumn;
  currency: ColumnType<string, string | undefined, string>;
  odds: DecimalColumn | null;
  potential_win: DecimalColumn;
  win_amount: DecimalColumn | null;
  risk_score: ColumnType<number, number | undefined, number>;
  risk_flags: ColumnType<string[], string[] | undefined, string[]>;
  ip_address: string | null;
  selections: ColumnType<unknown, unknown, unknown> | null;
  result: ColumnType<unknown, unknown, unknown> | null;
  void_reason: string | null;
  created_at: CreatedAtColumn;
  settled_at: NullableTimestampColumn;
}

export interface Database {
  admin_users: AdminUsersTable;
  admin_roles: AdminRolesTable;
  admin_sessions: AdminSessionsTable;
  role_assignments: RoleAssignmentsTable;
  maker_checker_requests: MakerCheckerRequestsTable;
  case_queue_items: CaseQueueItemsTable;
  break_glass_grants: BreakGlassGrantsTable;
  audit_index: AuditIndexTable;
  audit_index_watermarks: AuditIndexWatermarksTable;
  players: PlayersTable;
  member_groups: MemberGroupsTable;
  member_group_members: MemberGroupMembersTable;
  player_devices: PlayerDevicesTable;
  bulk_operations: BulkOperationsTable;
  transactions: TransactionsTable;
  games: GamesTable;
  bets: BetsTable;
}
