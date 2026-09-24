import 'reflect-metadata';
import fastifyCookie from '@fastify/cookie';
// @nestjs/platform-fastify@10.4.22 boots fastify@4.28.1 internally
// despite this package.json declaring fastify ^5.2.0 for its own type
// imports (see platform/CLAUDE.md's "two different fastify majors
// present at once" note, found the hard way on other services in this
// same monorepo) - @fastify/cors and @fastify/cookie are pinned to the
// major line built for fastify 4.x to match what's actually running,
// and .register() below still needs the cast that finding required.
import fastifyCors from '@fastify/cors';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { createLogger } from '@platform/logging';
import { AppModule } from './http/app.module.js';
import { loadBackofficeConfig } from './config.js';

const logger = createLogger('backoffice-api');

async function bootstrap(): Promise<void> {
  const config = loadBackofficeConfig();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: false, // @platform/logging is the logger everywhere in this service
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCors as any, { origin: config.CORS_ORIGIN, credentials: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(fastifyCookie as any);

  await app.listen(config.PORT, '0.0.0.0');
  logger.info({ port: config.PORT }, 'backoffice-api service listening');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'failed to start backoffice-api service');
  process.exitCode = 1;
});
