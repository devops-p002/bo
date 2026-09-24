# syntax=docker/dockerfile:1
#
# Built from the repo root (see docker-compose.yml's `context: .`) so the
# pnpm workspace resolves the same way it does everywhere else in this
# repo, even though this particular app has no workspace-package deps of
# its own today.
#
# Vite bakes REACT_APP_* values into the static bundle at build time (see
# vite.config.js's `define` block) - there's no runtime env var to change
# after the image is built, so these have to be build ARGs, not container
# environment.
FROM node:22-bookworm-slim AS build
RUN corepack enable
WORKDIR /repo
COPY . .

ARG REACT_APP_API_URL
ARG REACT_APP_GRAPHQL_HTTP_URL
ARG REACT_APP_GRAPHQL_WS_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL} \
    REACT_APP_GRAPHQL_HTTP_URL=${REACT_APP_GRAPHQL_HTTP_URL} \
    REACT_APP_GRAPHQL_WS_URL=${REACT_APP_GRAPHQL_WS_URL}

RUN pnpm install --frozen-lockfile
RUN pnpm --filter gaming-platform build

FROM nginx:1.27-alpine
COPY --from=build /repo/apps/backoffice-web/dist /usr/share/nginx/html
COPY apps/backoffice-web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
