// tasks_module.ts

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { LoggerMiddleware } from './logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { NotificationsModule } from '../notifications/notifications.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),

    // Import NotificationsModule so TasksService can inject NotificationsService
    NotificationsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('tasks'); // applies to all /tasks routes
  }
}