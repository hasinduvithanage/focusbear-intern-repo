import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { Task } from './tasks/task.entity';
import { envValidationSchema } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    // ---------------------------------------------------------------
    // PINO LOGGER — Structured JSON logging for the entire app
    //
    // In production (NODE_ENV=production):
    //   - Outputs raw JSON: {"level":"info","time":1700000000,"msg":"..."}
    //   - Log level set to 'info' (debug/trace messages are dropped)
    //   - Perfect for log aggregation tools (Datadog, CloudWatch, ELK)
    //
    // In development (any other NODE_ENV):
    //   - Uses pino-pretty for human-readable coloured output
    //   - Log level set to 'debug' (see everything)
    //   - Shows timestamps in a readable format
    //
    // autoLogging: true — automatically logs every HTTP request with
    // method, URL, status code, and response time. Replaces your
    // LoggerMiddleware with structured, consistent request logging.
    // ---------------------------------------------------------------
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',

            // Pretty print in development, raw JSON in production
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                    ignore: 'pid,hostname',
                  },
                },

            // Automatically log every HTTP request/response
            autoLogging: true,

            // Don't log the request/response bodies (they may contain sensitive data)
            serializers: {
              req: (req: any) => ({
                method: req.method,
                url: req.url,
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };
      },
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5433),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'focusbear_dev'),
        entities: [Task],
        synchronize: false,
        logging: true,
      }),
    }),

    // Background jobs
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),

    AuthModule,
    TasksModule,
    NotificationsModule,
  ],
})
export class AppModule {}