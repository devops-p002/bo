# BO — admin backoffice monorepo

## Architecture

- `apps/backoffice-web`: the original admin dashboard (React 18 + Vite +
  Tailwind), being incrementally rewired off its old mock GraphQL backend
  onto real REST endpoints, page by page.
- `services/backoffice-api`: NestJS/Fastify + Kysely/Postgres. Every admin
  feature's data model lives directly in this one service/database —
  consolidated, not split into separate microservices. That's a deliberate
  choice: this repo is admin-only for now, and the money-custody isolation
  that justified microservices in the earlier `platform/` build doesn't
  apply to an admin dashboard with no player-facing money movement.
- `packages/{audit-chain,config,errors,ids,logging}`: shared, brought over
  from `platform/`.

## Standing rules

1. **Theme**: navy/blue flat theme, loosely Melon-inspired
   (`tailwind.config.js`'s `primary`/`navy`/`success`/`warning`/`error`
   tokens). Whenever touching a file, apply it properly — no stray
   `gray-800`/`blue-600` Tailwind defaults left behind.
2. **Comments**: minimal. Only for genuinely non-obvious rationale — never
   narrate what code does or restate which backend field something maps
   to.
3. **Identity**: player identity and login are email-only. `username` is
   optional, display-only, never required, never used for lookup.
4. **CI/CD**: every push to `main` auto-runs `verify` (lint + typecheck)
   then `deploy` (build, migrate, `docker compose up`) via
   `.github/workflows/deploy.yml` on the self-hosted VM runner — no manual
   deploy steps.
5. Wire pages to real data only. Never fabricate a field with no backend
   model. If a page's mock data has no backend equivalent yet, either
   build the real backend for it, or leave it honestly labeled as not
   implemented — never a silent fake value.

## Wiring plan (admin dashboard, phase by phase)

1. Members — `players` table. Search/profile done; VIP/Group/Mass-Update
   still pending.
2. Payments — `transactions` table (deposit/withdrawal/bonus/refund),
   subsections: Deposit Management, Withdrawal Management, Transaction
   History, Payment Methods (stays mock - no backend model requested yet).
3. Bets — `bets` table: Pending, Settlement, Patterns, Limits.
4. Marketing — `bonus_templates` + `bonus_issuances`.
5. Risk — `risk_alerts` + queries over transactions/bets.
6. Reports — pure aggregation endpoints, no new tables.
7. CMS — `games` catalog.
8. Settings — real staff management on `admin_users`; roles read-only
   (code-defined, not admin-editable).
9. Dashboard — live aggregates once 2-4 exist.
10-12. CRM / Referral / Affiliate — genuinely new subsystems, no existing
   precedent. Confirm the data model before building.
