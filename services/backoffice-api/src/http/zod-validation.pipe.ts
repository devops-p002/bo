import type { PipeTransform } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ValidationError } from '@platform/errors';
import type { ZodType, ZodTypeDef } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T, ZodTypeDef, unknown>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ValidationError('Request body failed validation', {
        meta: { issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
      });
    }
    return result.data;
  }
}
