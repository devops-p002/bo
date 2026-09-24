# syntax=docker/dockerfile:1
#
# Built from the repo root (see docker-compose.yml's `context: .` for this
# service) - player-api depends on workspace packages, so the build needs
# the whole pnpm workspace present, not just this directory. Same
# Debian-slim-not-alpine rationale as services/backoffice-api/Dockerfile:
# argon2 is a native addon and alpine's musl libc is a documented source
# of breakage for it.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@platform/player-api...

ENV NODE_ENV=production
WORKDIR /repo/services/player-api
EXPOSE 5200
CMD ["node", "dist/main.js"]
