import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';

// ---------------------------------------------------------------
// This module sets up everything for the notifications queue:
//
// 1. registerQueue() — creates a BullMQ queue named 'notifications'
//    in Redis. The name must match the @Processor() decorator and
//    the @InjectQueue() call in the service.
//
// 2. NotificationsService — the PRODUCER that adds jobs to the queue
//
// 3. NotificationsProcessor — the CONSUMER that processes jobs
//
// defaultJobOptions sets sensible defaults for all jobs in this queue:
//   - attempts: 3 — retry up to 3 times on failure
//   - backoff exponential 1000ms — wait 1s, then 2s, then 4s
//   - removeOnComplete: true — clean up finished jobs from Redis
//   - removeOnFail: false — keep failed jobs for debugging
// ---------------------------------------------------------------

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}