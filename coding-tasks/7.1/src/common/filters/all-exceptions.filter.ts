import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

// ---------------------------------------------------------------
// GLOBAL EXCEPTION FILTER
//
// Catches EVERY error in the app — whether it's a known HttpException
// (like NotFoundException, ForbiddenException) or an unexpected error
// (database failure, null pointer, Redis timeout).
//
// It does two things:
//   1. LOGS the error with full context (structured, via Pino)
//   2. RESPONDS to the user with a clean, consistent format
//
// WHY THIS MATTERS:
//   Without this filter, unexpected errors return:
//     {"statusCode":500,"message":"Internal server error"}
//   No context, no timestamp, no request info.
//
//   With this filter, every error response looks like:
//     {
//       "statusCode": 404,
//       "message": "Task \"abc\" not found",
//       "error": "Not Found",
//       "timestamp": "2026-03-20T12:00:00.000Z",
//       "path": "/tasks/abc"
//     }
//
// SECURITY NOTE:
//   In production, stack traces and internal details are NEVER
//   sent to the user. They're only logged server-side.
// ---------------------------------------------------------------

@Catch() // No argument = catch EVERYTHING
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const reply = ctx.getResponse<FastifyReply>();

    // ---------------------------------------------------------------
    // Determine the status code and message based on the error type
    // ---------------------------------------------------------------
    let statusCode: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      // Known errors: NotFoundException, ForbiddenException, etc.
      // These are intentional — the app threw them on purpose
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        error = resp.error || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      // Unexpected errors: database failures, null pointers, etc.
      // These are bugs or infrastructure issues
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';
    } else {
      // Something very unusual was thrown (not even an Error object)
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Unknown Error';
    }

    // ---------------------------------------------------------------
    // LOG the error — this goes to Pino (structured JSON in production)
    //
    // For 4xx errors (client mistakes): log as WARN
    //   → user sent a bad request, not our fault
    //
    // For 5xx errors (server problems): log as ERROR with stack trace
    //   → something is broken, we need to investigate
    // ---------------------------------------------------------------
    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${statusCode}: ${
          exception instanceof Error ? exception.message : 'Unknown error'
        }`,
        exception instanceof Error ? exception.stack : undefined,
        AllExceptionsFilter.name,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${statusCode}: ${message}`,
        AllExceptionsFilter.name,
      );
    }

    // ---------------------------------------------------------------
    // RESPOND to the user with a clean, consistent format
    // Never expose stack traces or internal details to the client
    // ---------------------------------------------------------------
    reply.status(statusCode).send({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
