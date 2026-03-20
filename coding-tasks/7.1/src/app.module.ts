import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),

    // ---------------------------------------------------------------
    // TypeORM — your existing database config (unchanged)
    // ---------------------------------------------------------------
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

    // ---------------------------------------------------------------
    // BullMQ — NEW: connects to Redis for background job processing
    //
    // forRoot() sets the global Redis connection that ALL queues share.
    // Individual queues are registered in their own modules with
    // BullModule.registerQueue().
    //
    // Add REDIS_HOST and REDIS_PORT to your .env file.
    // ---------------------------------------------------------------
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

    TasksModule,
    NotificationsModule,
  ],
})
export class AppModule {}