import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { WalletService } from '../wallet.service.js';
import type { ListTransactionsQueryDto, RequestTransactionDto } from './dto.js';
import { listTransactionsQuerySchema, requestTransactionSchema } from './dto.js';
import type { AuthenticatedPlayerRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  async getWallet(@Req() req: AuthenticatedPlayerRequest) {
    return this.wallet.getWallet(req.playerId!);
  }

  @Post('deposit')
  async deposit(@Req() req: AuthenticatedPlayerRequest, @Body(new ZodValidationPipe(requestTransactionSchema)) body: RequestTransactionDto) {
    return this.wallet.requestTransaction(req.playerId!, 'DEPOSIT', body);
  }

  @Post('withdraw')
  async withdraw(@Req() req: AuthenticatedPlayerRequest, @Body(new ZodValidationPipe(requestTransactionSchema)) body: RequestTransactionDto) {
    return this.wallet.requestTransaction(req.playerId!, 'WITHDRAWAL', body);
  }

  @Get('transactions')
  async listTransactions(@Req() req: AuthenticatedPlayerRequest, @Query(new ZodValidationPipe(listTransactionsQuerySchema)) query: ListTransactionsQueryDto) {
    return this.wallet.listTransactions(req.playerId!, { page: query.page, limit: query.limit });
  }
}
