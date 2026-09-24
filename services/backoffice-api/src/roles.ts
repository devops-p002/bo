import type { MakerCheckerActionType } from './db/schema.js';

/** The eight roles seeded by the admin_roles migration - see that
 * migration's own comment for what each is for. */
export const ROLES = [
  'super_admin',
  'finance',
  'trading',
  'responsible_gambling',
  'auditor',
  'risk_compliance',
  'support',
  'marketing',
] as const;

export type Role = (typeof ROLES)[number];

/** Which role owns (may both create and approve) each maker-checker
 * action type - see the admin_roles migration's comment. `support` is
 * deliberately absent from every entry: it owns nothing here, which is
 * exactly what the Phase 6 acceptance criterion's 403 test exercises. */
export const ACTION_TYPE_OWNING_ROLE: Record<MakerCheckerActionType, Role> = {
  balance_adjustment: 'finance',
  payout: 'finance',
  manual_settlement: 'trading',
  odds_override: 'trading',
  limit_change: 'responsible_gambling',
  export: 'auditor',
};

/** true if `roles` includes the action's owning role or super_admin. */
export function canActOnActionType(roles: readonly string[], actionType: MakerCheckerActionType): boolean {
  if (roles.includes('super_admin')) return true;
  return roles.includes(ACTION_TYPE_OWNING_ROLE[actionType]);
}
