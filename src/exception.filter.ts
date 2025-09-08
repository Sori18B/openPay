import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Error interno del servidor';
    let error = 'Internal Server Error';

    // 1. Errores de NestJS (HttpException)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      // Puede ser string o un objeto dependiendo de cómo se lanzó
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any).message || res;
        error = (res as any).error || error;
      }
    }

    // 2. Errores de Prisma
    else if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // unique constraint violation
          status = HttpStatus.CONFLICT;
          message = `Valor duplicado en: ${exception.meta?.target}`;
          error = 'Conflict';
          break;

        case 'P2001': // record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Registro no encontrado';
          error = 'Not Found';
          break;

        case 'P2000': // valor inválido en campo
          status = HttpStatus.BAD_REQUEST;
          message = 'Valor inválido para algún campo';
          error = 'Bad Request';
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          message = `Error de Prisma: ${exception.message}`;
          error = 'Database Error';
          break;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
