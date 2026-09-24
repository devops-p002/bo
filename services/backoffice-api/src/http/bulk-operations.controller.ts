import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UnauthenticatedError } from '@platform/errors';
import { BulkOperationsService } from '../bulk-operations.service.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { CreateBulkOperationDto } from './dto.js';
import { createBulkOperationSchema } from './dto.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

@Controller('bulk-operations')
@UseGuards(JwtAuthGuard)
export class BulkOperationsController {
  constructor(private readonly bulkOperations: BulkOperationsService) {}

  @Get()
  async list() {
    return this.bulkOperations.list();
  }

  @Post()
  async create(@Req() req: AuthenticatedAdminRequest, @Body(new ZodValidationPipe(createBulkOperationSchema)) body: CreateBulkOperationDto) {
    if (!req.adminUserId) throw new UnauthenticatedError();
    return this.bulkOperations.create({ ...body, createdBy: req.adminUserId });
  }
}
