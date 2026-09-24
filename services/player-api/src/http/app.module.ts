import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import type { Kysely } from 'kysely';
import { PLAYER_API_CONFIG, loadPlayerApiConfig } from '../config.js';
import type { PlayerApiConfig } from '../config.js';
import { createDb } from '../db/connection.js';
import type { Database } from '../db/schema.js';
import { GamesService } from '../games.service.js';
import { PlayerAuthService } from '../player-auth.service.js';
import { WalletService } from '../wallet.service.js';
import { AppErrorFilter } from './app-error.filter.js';
import { AuthController } from './auth.controller.js';
import { GamesController } from './games.controller.js';
import { WalletController } from './wallet.controller.js';
import { DB_TOKEN } from './tokens.js';

export { DB_TOKEN };

@Module({
  controllers: [AuthController, WalletController, GamesController],
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: (): Kysely<Database> => createDb({ connectionString: loadPlayerApiConfig().DATABASE_URL }),
    },
    { provide: PLAYER_API_CONFIG, useFactory: (): PlayerApiConfig => loadPlayerApiConfig() },
    {
      provide: PlayerAuthService,
      inject: [DB_TOKEN, PLAYER_API_CONFIG],
      useFactory: (db: Kysely<Database>, config: PlayerApiConfig) =>
        new PlayerAuthService(db, { jwtSecret: config.PLAYER_JWT_SECRET, accessTokenTtlSeconds: config.PLAYER_ACCESS_TOKEN_TTL_SECONDS }),
    },
    {
      provide: WalletService,
      inject: [DB_TOKEN],
      useFactory: (db: Kysely<Database>) => new WalletService(db),
    },
    {
      provide: GamesService,
      inject: [DB_TOKEN],
      useFactory: (db: Kysely<Database>) => new GamesService(db),
    },
    { provide: APP_FILTER, useClass: AppErrorFilter },
  ],
})
export class AppModule {}
