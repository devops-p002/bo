import { createReadStream, existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { Controller, Get, Inject, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ValidationError } from '@platform/errors';
import { defineId } from '@platform/ids';
import type { FastifyReply } from 'fastify';
import type { PlayerApiConfig } from '../config.js';
import { PLAYER_API_CONFIG } from '../config.js';
import { KycService } from '../kyc.service.js';
import { submitKycFieldsSchema } from './dto.js';
import type { AuthenticatedPlayerRequest } from './jwt-auth.guard.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const KycUploadId = defineId('KycUploadId');

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

/** Player-facing KYC submission - see services/backoffice-api's
 * KycController for the admin review half. Uses @fastify/multipart
 * directly (not a Multer interceptor - this stack runs on
 * @nestjs/platform-fastify, see main.ts's comment) so JSON fields and
 * the three required image files travel in one multipart/form-data
 * request, matching the reference screenshot's single submit action. */
@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(
    private readonly kyc: KycService,
    @Inject(PLAYER_API_CONFIG) private readonly config: PlayerApiConfig,
  ) {}

  @Get('verification/me')
  async getMine(@Req() req: AuthenticatedPlayerRequest) {
    return this.kyc.getLatest(req.playerId!);
  }

  @Get('verification/:id/image/:which')
  async getImage(@Req() req: AuthenticatedPlayerRequest, @Param('id') id: string, @Param('which') which: string, @Res() res: FastifyReply) {
    if (which !== 'front' && which !== 'back' && which !== 'selfie') throw new ValidationError('Unknown image');
    const path = await this.kyc.getImagePath(req.playerId!, id, which);
    if (!existsSync(path)) throw new ValidationError('Image not found');
    const contentType = CONTENT_TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream';
    res.type(contentType);
    return res.send(createReadStream(path));
  }

  @Post('verification')
  async submit(@Req() req: AuthenticatedPlayerRequest) {
    const fields: Record<string, string> = {};
    const savedPaths: Record<string, string> = {};

    await mkdir(this.config.UPLOADS_DIR, { recursive: true });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const part of (req as any).parts()) {
      if (part.type === 'file') {
        if (!['front', 'back', 'selfie'].includes(part.fieldname)) {
          part.file.resume();
          continue;
        }
        const ext = ALLOWED_MIME_TO_EXT[part.mimetype];
        if (!ext) throw new ValidationError(`${part.fieldname}: only JPG/JPEG/PNG images are accepted`);

        const buffer = await part.toBuffer();
        if (buffer.byteLength > 3 * 1024 * 1024) throw new ValidationError(`${part.fieldname}: file exceeds the 3MB limit`);

        const filename = `${KycUploadId.generate()}-${part.fieldname}${ext}`;
        const fullPath = `${this.config.UPLOADS_DIR}/${filename}`;
        await writeFile(fullPath, buffer);
        savedPaths[part.fieldname] = fullPath;
      } else {
        fields[part.fieldname] = String(part.value);
      }
    }

    for (const type of ['front', 'back', 'selfie']) {
      if (!savedPaths[type]) throw new ValidationError(`Missing ${type} image`);
    }

    const result = submitKycFieldsSchema.safeParse({
      documentType: fields.documentType,
      documentNumber: fields.documentNumber,
      expiryDate: fields.expiryDate,
    });
    if (!result.success) {
      throw new ValidationError('Request fields failed validation', {
        meta: { issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      });
    }
    const parsed = result.data;

    return this.kyc.submit(req.playerId!, {
      documentType: parsed.documentType,
      documentNumber: parsed.documentNumber,
      expiryDate: parsed.expiryDate,
      frontImagePath: savedPaths.front!,
      backImagePath: savedPaths.back!,
      selfieImagePath: savedPaths.selfie!,
    });
  }
}
