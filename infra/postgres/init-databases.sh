#!/usr/bin/env bash
# Runs once, automatically, on a fresh Postgres data volume (Postgres's own
# docker-entrypoint-initdb.d convention - this never re-runs against an
# existing volume, so it's safe to be non-idempotent).
#
# Creates the backoffice_api database and its least-privilege application
# role. backoffice-api's own migrations (see its grants migration) apply
# real table-level grants on top of this - this script only establishes
# the database boundary and a connect-only role.
set -euo pipefail

service=backoffice_api
password="${SERVICE_DB_PASSWORD_BACKOFFICE_API:-dev_only_backoffice_api_password}"

echo "Provisioning database and role for service: ${service}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-SQL
  CREATE DATABASE ${service};
  CREATE ROLE ${service}_app WITH LOGIN PASSWORD '${password}';
  REVOKE ALL ON DATABASE ${service} FROM PUBLIC;
  GRANT CONNECT ON DATABASE ${service} TO ${service}_app;
SQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "${service}" <<-SQL
  REVOKE ALL ON SCHEMA public FROM PUBLIC;
  GRANT USAGE ON SCHEMA public TO ${service}_app;
SQL

echo "Database provisioning complete: ${service}"

# services/player-api's own player_api_app role is deliberately NOT
# created here - unlike this script (fresh-volume-only, never re-runs
# against production's already-existing volume), the player-api-grants
# migration creates it idempotently and runs on every deploy, so that's
# what actually takes effect in production. See that migration for why.
