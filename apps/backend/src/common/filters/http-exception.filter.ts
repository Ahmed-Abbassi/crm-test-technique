import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  errors: string[];
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || message;

        if (Array.isArray(resp.message)) {
          errors = resp.message as string[];
          message = errors.join('; ');
        } else if (typeof resp.message === 'string') {
          errors = [resp.message];
          message = resp.message;
        }
      }
    }

    // Handle Prisma unique constraint violations
    if (
      exception instanceof Error &&
      'code' in exception &&
      (exception as Record<string, unknown>).code === 'P2002'
    ) {
      statusCode = HttpStatus.CONFLICT;
      message = 'A record with this value already exists';
      errors = ['Duplicate field value'];
    }

    // Handle Prisma not found
    if (
      exception instanceof Error &&
      'code' in exception &&
      (exception as Record<string, unknown>).code === 'P2025'
    ) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      errors = ['The requested resource does not exist'];
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}