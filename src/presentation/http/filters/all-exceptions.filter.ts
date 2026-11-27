import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  DataSourceReloadError,
  InvalidIntervalLimitError,
} from '../../../domain/errors/domain.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const { statusCode, message } = this.mapException(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `HTTP ${statusCode} on ${request.method} ${request.url}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    void reply.status(statusCode).send({
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private mapException(exception: unknown): {
    statusCode: number;
    message: string | string[];
  } {
    if (exception instanceof InvalidIntervalLimitError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      };
    }

    if (exception instanceof DataSourceReloadError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return { statusCode, message: response };
      }

      if (
        typeof response === 'object' &&
        response !== null &&
        'message' in response
      ) {
        const extractedMessage = (response as { message: string | string[] })
          .message;
        return { statusCode, message: extractedMessage };
      }

      return { statusCode, message: exception.message };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    };
  }
}
