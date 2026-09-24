import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from '../transactions.service.js';
import type { CreateTransactionDto, ListTransactionsQueryDto, UpdateTransactionStatusDto } from './dto.js';
import { createTransactionSchema, listTransactionsQuerySchema, updateTransactionStatusSchema } from './dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

/** Backs the Payments section of apps/backoffice-web (Deposit/Withdrawal
 * Management, Transaction History). Players create PENDING rows through
 * services/player-api's own wallet endpoints (a separate least-privilege
 * DB role with no UPDATE grant on this table) - approving/rejecting is
 * exclusively an admin action through this controller. */
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listTransactionsQuerySchema)) query: ListTransactionsQueryDto) {
    const filter = {
      type: query.type,
      status: query.status,
      paymentMethod: query.paymentMethod,
      currency: query.currency,
      playerId: query.playerId,
      search: query.search,
      minAmount: query.minAmount,
      maxAmount: query.maxAmount,
      dateRange: query.dateRangeStart && query.dateRangeEnd ? { start: query.dateRangeStart, end: query.dateRangeEnd } : undefined,
    };
    return this.transactions.list(filter, { page: query.page, limit: query.limit });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.transactions.getById(id);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createTransactionSchema)) body: CreateTransactionDto) {
    return this.transactions.create(body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body(new ZodValidationPipe(updateTransactionStatusSchema)) body: UpdateTransactionStatusDto) {
    return this.transactions.updateStatus(id, body);
  }
}
