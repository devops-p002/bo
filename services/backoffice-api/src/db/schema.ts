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
  username: string;
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
  created_at: CreatedAtColumn;
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
}
