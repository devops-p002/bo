# BO — admin backoffice monorepo

## Architecture

- `apps/backoffice-web`: the admin dashboard (React 18 + Vite + Tailwind),
  being incrementally rewired off its old mock GraphQL backend onto real
  REST endpoints, page by page.
- `services/backoffice-api`: NestJS/Fastify + Kysely/Postgres. Every admin
  feature's data model lives directly in this one service/database —
  consolidated, not split into separate microservices. That's still the
  right call for the admin side even now that a player-facing app exists
  (below): admin features have no money-custody isolation need of their
  own, unlike the earlier `platform/` build's per-domain services.
- `apps/player-web`: the player-facing site (React 18 + Vite + Tailwind,
  dark casino theme, Stake-inspired layout/UX under original branding -
  "Sunrion"). Real auth, wallet (deposit/withdraw requests), and a games
  catalog browsing UI. No real game engine exists yet - a game's detail
  page is an honest "not wired up" placeholder, not a fake spin/deal flow.
- `services/player-api`: NestJS/Fastify + Kysely, its own least-privilege
  `player_api_app` DB role against the SAME `backoffice_api` database
  (not a separate one) - it shares the `players`/`transactions`/`games`
  tables backoffice-api's migrations own, duplicating the small subset of
  `db/schema.ts` it actually touches rather than importing backoffice-
  api's (see `jwt.ts`'s "no cross-service imports" comment). A player can
  create a PENDING deposit/withdrawal request and read their own history;
  `player_api_app` has no UPDATE grant on `transactions` at all -
  approving/rejecting one, the only thing that ever moves balance, stays
  exclusively an admin action through backoffice-api's own
  TransactionsService. This is the intended cross-app wiring: player-web
  generates real requests, the backoffice Payments pages (once rewired -
  see the wiring plan below) approve them against the same data.
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

1. Members — `players` table. Done (Search/profile/VIP/Group/Mass-Update).
2. Payments — `transactions` table (deposit/withdrawal/bonus/refund) and
   its backend (list/create/approve-reject-cancel, balance-crediting on
   COMPLETED) are built - real rows now come from apps/player-web's own
   wallet actions, not just admin-created test data. The admin frontend
   (Deposit Management, Withdrawal Management, Transaction History) is
   still on its old GraphQL mock and needs rewiring onto this REST API.
   Payment Methods stays mock either way - no backend model requested.
3. Bets — `bets` table: Pending, Settlement, Patterns, Limits.
4. Marketing — `bonus_templates` + `bonus_issuances`.
5. Risk — `risk_alerts` + queries over transactions/bets.
6. Reports — pure aggregation endpoints, no new tables.
7. CMS — the `games` table already exists (built for apps/player-web's
   catalog, seeded with a fixed set of rows) and its schema/data don't
   need to change - this phase is giving admins CRUD over it, not
   creating it.
8. Settings — real staff management on `admin_users`; roles read-only
   (code-defined, not admin-editable).
9. Dashboard — live aggregates once 2-4 exist.
10-12. CRM / Referral / Affiliate — genuinely new subsystems, no existing
   precedent. Confirm the data model before building.
