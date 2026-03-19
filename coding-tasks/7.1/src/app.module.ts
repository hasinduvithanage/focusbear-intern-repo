import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
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

        // -----------------------------------------------------------
        // CHANGED: synchronize is now FALSE.
        //
        // Previously you had synchronize: true, which auto-altered the
        // DB to match entities on every app start. That's convenient
        // but dangerous — it can silently drop columns and data.
        //
        // Now migrations handle all schema changes explicitly.
        // -----------------------------------------------------------
        synchronize: false,

        logging: true,
      }),
    }),
    TasksModule,
  ],
})
export class AppModule {}