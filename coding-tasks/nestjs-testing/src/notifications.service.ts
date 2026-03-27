// ---------------------------------------------------------------
// NOTIFICATIONS SERVICE
//
// In your 7.1 project, this uses BullMQ to queue background jobs.
// Here we define it as a simple injectable service so we can
// mock it in tests.
// ---------------------------------------------------------------

import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendTaskCreatedNotification(taskId: string, title: string): Promise<void> {
    // In production: queues a BullMQ job
    // We never want this to run in tests
  }

  async sendTaskCompletedNotification(taskId: string, title: string): Promise<void> {
    // In production: queues a BullMQ job
  }

  async sendReminder(taskId: string, title: string, delayMs: number): Promise<void> {
    // In production: queues a delayed BullMQ job
  }
}
