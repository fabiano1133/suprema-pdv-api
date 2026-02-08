import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { DomainValidationException } from '../../../application/errors/domain-validation.exception';

export interface ExceptionResponseDto {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}

/**
 * Filtro global que captura todas as exceções do sistema (NestJS).
 * Usa HttpAdapterHost para ser agnóstico à plataforma (Express/Fastify).
 * HttpException (e subclasses): status e mensagem da exceção.
 * DomainValidationException: 400 Bad Request (campos obrigatórios, regras de domínio).
 * Demais exceções: 500 Internal Server Error.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const { statusCode, responseBody } = this.buildResponse(exception, request);
    this.logException(exception, statusCode, request);

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }

  private buildResponse(
    exception: unknown,
    request: Request,
  ): { statusCode: number; responseBody: ExceptionResponseDto } {
    const path = request.url ?? (request as { originalUrl?: string }).originalUrl ?? '/';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string' ? res : (res as { message?: string }).message;
      const error =
        typeof res === 'object' && res !== null && 'error' in res
          ? (res as { error?: string }).error
          : undefined;
      return {
        statusCode: status,
        responseBody: {
          statusCode: status,
          message: Array.isArray(message) ? message[0] : message ?? 'Erro',
          error,
          timestamp: new Date().toISOString(),
          path,
        },
      };
    }

    if (exception instanceof DomainValidationException) {
      const statusCode = HttpStatus.BAD_REQUEST;
      return {
        statusCode,
        responseBody: {
          statusCode,
          message: exception.message,
          error: 'Bad Request',
          timestamp: new Date().toISOString(),
          path,
        },
      };
    }

    const statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    return {
      statusCode,
      responseBody: {
        statusCode,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        path,
      },
    };
  }

  private logException(
    exception: unknown,
    statusCode: number,
    request: Request,
  ): void {
    if (statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
        `${request.method} ${request.url}`,
      );
    }
  }
}