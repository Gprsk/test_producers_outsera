import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsedMs = Date.now() - startTime;
        this.logger.log(`${request.method} ${request.url} - ${elapsedMs}ms`);
      }),
    );
  }
}
