import 'reflect-metadata';
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

  await app.listen(config.PORT, '0.0.0.0');
  logger.info({ port: config.PORT }, 'backoffice-api service listening');
}

bootstrap().catch((err) => {
  logger.error({ err }, 'failed to start backoffice-api service');
  process.exitCode = 1;
});
