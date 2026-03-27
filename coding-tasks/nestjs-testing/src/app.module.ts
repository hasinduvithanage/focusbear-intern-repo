// ---------------------------------------------------------------
// APP MODULE — For Integration Testing
//
// This module wires together the controller, service, guards,
// and mock providers into a complete NestJS application that
// Supertest can send HTTP requests to.
//
// In your real 7.1 project, AppModule imports TypeOrmModule,
// BullModule, ConfigModule, etc. Here we keep it minimal —
// just enough to test the HTTP pipeline.
// ---------------------------------------------------------------

import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService, TASK_REPOSITORY } from './tasks.service';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    NotificationsService,
    {
      // In real project: TypeOrmModule.forFeature([Task]) provides this.
      // Here we provide a default mock that tests can override.
      provide: TASK_REPOSITORY,
      useValue: {
        create: (data: any) => ({ id: 'default-id', ...data, completed: false, priority: 'medium' }),
        save: async (task: any) => task,
        find: async () => [],
        findOneBy: async () => null,
        remove: async (task: any) => task,
      },
    },
  ],
})
export class AppModule {}
