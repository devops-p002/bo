# syntax=docker/dockerfile:1
#
# Built from the repo root (see docker-compose.yml's `context: .` for this
# service) - backoffice-api depends on five workspace packages
# (@platform/{audit-chain,config,errors,ids,logging}), so the build needs
# the whole pnpm workspace present, not just this directory.
#
# Debian slim, not alpine: argon2 (password hashing) is a native addon and
# alpine's musl libc is a real, documented source of native-module breakage
# that's cheaper to avoid than to debug on a production VM. python3/make/g++
# are the node-gyp fallback toolchain, only exercised if argon2 has no
# prebuilt binary for this image's exact platform/arch.
FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@platform/backoffice-api...

ENV NODE_ENV=production
WORKDIR /repo/services/backoffice-api
EXPOSE 5000
CMD ["node", "dist/main.js"]
