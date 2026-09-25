import { createReadStream, existsSync } from 'node:fs';
import { extname } from 'node:path';
import { Body, Controller, Get, Param, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { NotFoundError } from '@platform/errors';
import type { FastifyReply } from 'fastify';
import { KycService } from '../kyc.service.js';
import type { ListKycQueryDto, UpdateKycStatusDto } from './dto.js';
import { listKycQuerySchema, updateKycStatusSchema } from './dto.js';
import type { AuthenticatedAdminRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

/** Admin review surface for KYC: Risk > Verification in apps/backoffice-
 * web. Players create PENDING rows through services/player-api's own
 * KycController - approving/rejecting is exclusively an admin action
 * here, same boundary as TransactionsController/BetsController. */
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listKycQuerySchema)) query: ListKycQueryDto) {
    return this.kyc.list({ status: query.status, playerId: query.playerId, search: query.search }, { page: query.page, limit: query.limit });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.kyc.getById(id);
  }

  @Get(':id/image/:which')
  async getImage(@Param('id') id: string, @Param('which') which: string, @Res() res: FastifyReply) {
    if (which !== 'front' && which !== 'back' && which !== 'selfie') throw new NotFoundError('Unknown image');
    const path = await this.kyc.getImagePath(id, which);
    if (!existsSync(path)) throw new NotFoundError('Image not found');
    const contentType = CONTENT_TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream';
    res.type(contentType);
    return res.send(createReadStream(path));
  }

  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Req() req: AuthenticatedAdminRequest, @Body(new ZodValidationPipe(updateKycStatusSchema)) body: UpdateKycStatusDto) {
    return this.kyc.updateStatus(id, { status: body.status, rejectionReason: body.rejectionReason, reviewedBy: req.adminUserId! });
  }
}
