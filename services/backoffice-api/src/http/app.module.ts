import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import type { Kysely } from 'kysely';
import { BACKOFFICE_CONFIG, loadBackofficeConfig } from '../config.js';
import type { BackofficeConfig } from '../config.js';
import { createDb } from '../db/connection.js';
import { PostgresAuditChainStore } from '../db/postgres-audit-chain-store.js';
import type { Database } from '../db/schema.js';
import { AdminAuthService } from '../admin-auth.service.js';
import { AuditIndexService } from '../audit-index.service.js';
import type { AuditSource } from '../audit-index.service.js';
import { BreakGlassService } from '../break-glass.service.js';
import { CaseQueueService } from '../case-queue.service.js';
import { MakerCheckerService } from '../maker-checker.service.js';
import { PlayerLookupService } from '../player-lookup.service.js';
import { AppErrorFilter } from './app-error.filter.js';
import { AdminAuthController, AuthController } from './admin-auth.controller.js';
import { AuditIndexController } from './audit-index.controller.js';
import { BreakGlassController } from './break-glass.controller.js';
import { CaseQueueController } from './case-queue.controller.js';
import { MakerCheckerController } from './maker-checker.controller.js';
import { PlayerLookupController } from './player-lookup.controller.js';
import { RolesGuard } from './roles.guard.js';
import { DB_TOKEN } from './tokens.js';

export { DB_TOKEN };

@Module({
  controllers: [AdminAuthController, AuthController, MakerCheckerController, CaseQueueController, BreakGlassController, AuditIndexController, PlayerLookupController],
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: (): Kysely<Database> => createDb({ connectionString: loadBackofficeConfig().DATABASE_URL }),
    },
    { provide: BACKOFFICE_CONFIG, useFactory: (): BackofficeConfig => loadBackofficeConfig() },
    {
      provide: AdminAuthService,
      inject: [DB_TOKEN, BACKOFFICE_CONFIG],
      useFactory: (db: Kysely<Database>, config: BackofficeConfig) =>
        new AdminAuthService(db, new PostgresAuditChainStore(db), {
          jwtSecret: config.ADMIN_JWT_SECRET,
          accessTokenTtlSeconds: config.ADMIN_ACCESS_TOKEN_TTL_SECONDS,
        }),
    },
    {
      provide: CaseQueueService,
      inject: [DB_TOKEN],
      useFactory: (db: Kysely<Database>) => new CaseQueueService(db),
    },
    {
      provide: MakerCheckerService,
      inject: [DB_TOKEN, BACKOFFICE_CONFIG, CaseQueueService],
      useFactory: (db: Kysely<Database>, config: BackofficeConfig, caseQueue: CaseQueueService) =>
        new MakerCheckerService(
          db,
          new PostgresAuditChainStore(db),
          {
            ledgerBaseUrl: config.LEDGER_BASE_URL,
            sportsbookBaseUrl: config.SPORTSBOOK_BASE_URL,
            responsibleGamblingBaseUrl: config.RESPONSIBLE_GAMBLING_BASE_URL,
          },
          caseQueue,
        ),
    },
    {
      provide: BreakGlassService,
      inject: [DB_TOKEN],
      useFactory: (db: Kysely<Database>) => new BreakGlassService(db, new PostgresAuditChainStore(db)),
    },
    {
      provide: PlayerLookupService,
      inject: [DB_TOKEN, BACKOFFICE_CONFIG],
      useFactory: (db: Kysely<Database>, config: BackofficeConfig) => new PlayerLookupService(config.ACCOUNT_BASE_URL, new PostgresAuditChainStore(db)),
    },
    {
      provide: AuditIndexService,
      inject: [DB_TOKEN, BACKOFFICE_CONFIG],
      useFactory: (db: Kysely<Database>, config: BackofficeConfig) => {
        const sources: AuditSource[] = [
          { name: 'ledger', auditUrl: config.LEDGER_AUDIT_URL },
          { name: 'account', auditUrl: config.ACCOUNT_AUDIT_URL },
          { name: 'crypto', auditUrl: config.CRYPTO_AUDIT_URL },
          { name: 'game-wallet', auditUrl: config.GAME_WALLET_AUDIT_URL },
          { name: 'sportsbook', auditUrl: config.SPORTSBOOK_AUDIT_URL },
          { name: 'bonus', auditUrl: config.BONUS_AUDIT_URL },
          { name: 'responsible-gambling', auditUrl: config.RESPONSIBLE_GAMBLING_AUDIT_URL },
          { name: 'risk', auditUrl: config.RISK_AUDIT_URL },
        ];
        return new AuditIndexService(db, sources);
      },
    },
    RolesGuard,
    { provide: APP_FILTER, useClass: AppErrorFilter },
  ],
})
export class AppModule {}
