// tasks_module.ts

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { LoggerMiddleware } from './logger.middleware';

@Module({
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