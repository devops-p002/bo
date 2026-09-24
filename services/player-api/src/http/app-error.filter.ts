import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException } from '@nestjs/common';
import { toProblemDetails } from '@platform/errors';
import { createLogger } from '@platform/logging';
import type { FastifyReply } from 'fastify';

const logger = createLogger('player-api-http');

/** Converts every thrown error into an RFC 7807 problem-details response
 * - duplicated from services/backoffice-api's identical filter per this
 * repo's "no cross-service imports" convention. */
@Catch()
export class AppErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<{ url?: string }>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const detail = typeof response === 'string' ? response : ((response as { message?: string }).message ?? exception.message);

      if (status >= 500) {
        logger.error({ err: exception, url: request?.url }, 'unhandled error');
      } else {
        logger.warn({ status, url: request?.url }, 'request rejected');
      }

      reply
        .status(status)
        .type('application/problem+json')
        .send({
          type: `https://errors.platform.internal/HTTP_${status}`,
          title: exception.name,
          status,
          detail,
          code: `HTTP_${status}`,
          instance: request?.url,
        });
      return;
    }

    const problem = toProblemDetails(exception, request?.url);

    if (problem.status >= 500) {
      logger.error({ err: exception, url: request?.url }, 'unhandled error');
    } else {
      logger.warn({ code: problem.code, url: request?.url }, 'request rejected');
    }

    reply.status(problem.status).type('application/problem+json').send(problem);
  }
}
