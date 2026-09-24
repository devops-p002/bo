# syntax=docker/dockerfile:1
#
# Built from the repo root (see docker-compose.yml's `context: .`) so the
# pnpm workspace resolves the same way it does everywhere else in this
# repo. Vite bakes REACT_APP_* values into the static bundle at build
# time - see apps/backoffice-web/Dockerfile's identical comment on why
# these are build ARGs, not container environment.
FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN pnpm install --frozen-lockfile
RUN pnpm --filter player-web build

FROM nginx:1.27-alpine
COPY --from=build /repo/apps/player-web/dist /usr/share/nginx/html
COPY apps/player-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
