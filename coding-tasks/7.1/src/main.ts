// Load .env before any module imports so entity decorators can read process.env
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyRateLimit from '@fastify/rate-limit';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';
import { Logger } from 'nestjs-pino';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  // ---------------------------------------------------------------
  // RATE LIMITING — @fastify/rate-limit
  //
  // Limits each IP to 100 requests per minute globally.
  // Exceeding the limit returns HTTP 429 Too Many Requests.
  //
  // The X-RateLimit-* headers are added to every response so
  // clients can see how many requests they have remaining.
  // ---------------------------------------------------------------
  await app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Pino structured logger — replaces NestJS default console logger
  app.useLogger(app.get(Logger));

  // Your existing ValidationPipe (unchanged)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Your existing LoggingInterceptor (unchanged)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // NEW: Global exception filter for consistent error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(3000);
}
bootstrap();