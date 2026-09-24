import 'reflect-metadata';
import fastifyCookie from '@fastify/cookie';
// See services/backoffice-api/src/main.ts's identical comment: fastify 4.x
// vs 5.x mismatch between @nestjs/platform-fastify's runtime and this
// package.json's own type-only fastify dependency.
import fastifyCors from '@fastify/cors';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { createLogger } from '@platform/logging';
import { AppModule } from './http/app.module.js';
import { loadPlayerApiConfig } from './config.js';

const logger = createLogger('player-api');

async function bootstrap(): Promise<void> {
  const config = loadPlayerApiConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    // trustProxy: this service is only ever reached through cloudflared on
    // 127.0.0.1 (see docker-compose.yml's port binding) - without this,
    // req.ip is always the tunnel's own loopback address, not the
    // player's real IP, so last_login_ip/geolocation would silently
    // record "127.0.0.1" for every login.
    new FastifyAdapter({ trustProxy: true }),
    {
      logger: false, // @platform/logging is the logger everywhere in this service
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCors as any, { origin: config.CORS_ORIGIN, credentials: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCookie as any);

  await app.listen(config.PORT, '0.0.0.0');
  logger.info({ port: config.PORT }, 'player-api service listening');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'failed to start player-api service');
  process.exitCode = 1;
});
