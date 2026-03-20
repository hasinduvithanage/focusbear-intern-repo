import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// ---------------------------------------------------------------
// PRODUCER — This service adds jobs to the 'notifications' queue.
//
// Other services (like TasksService) inject NotificationsService
// and call its methods to schedule background work. The actual
// processing happens in notifications.processor.ts.
//
// Key pattern: the service method returns almost instantly because
// .add() just writes a small JSON payload to Redis. The heavy
// work (sending emails, push notifications) happens later in
// the processor.
// ---------------------------------------------------------------

@Injectable()
export class NotificationsService {
  constructor(
    // The queue name here MUST match the name in registerQueue()
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  // ---------------------------------------------------------------
  // Job type 1: Task assigned notification
  // Called when a task is created — notifies the assigned user
  // ---------------------------------------------------------------
  async sendTaskCreatedNotification(taskId: string, taskTitle: string) {
    const job = await this.notificationQueue.add(
      'task-created',  // job name — the processor uses this to route logic
      {                 // job data — the payload the processor will receive
        taskId,
        taskTitle,
        type: 'task-created',
        timestamp: new Date().toISOString(),
      },
    );

    console.log(`[Producer] Queued 'task-created' job ${job.id} for task: ${taskTitle}`);
    return job;
  }

  // ---------------------------------------------------------------
  // Job type 2: Task completed notification
  // Called when a task is marked as done — could trigger a streak
  // update, send a congratulations push, etc.
  // ---------------------------------------------------------------
  async sendTaskCompletedNotification(taskId: string, taskTitle: string) {
    const job = await this.notificationQueue.add(
      'task-completed',
      {
        taskId,
        taskTitle,
        type: 'task-completed',
        timestamp: new Date().toISOString(),
      },
    );

    console.log(`[Producer] Queued 'task-completed' job ${job.id} for task: ${taskTitle}`);
    return job;
  }

  // ---------------------------------------------------------------
  // Job type 3: Delayed reminder
  // Schedules a notification to fire after a delay (in milliseconds).
  // Example: remind the user about an incomplete task in 1 hour.
  //
  // The { delay } option tells BullMQ to put this in the 'delayed'
  // sorted set in Redis. It won't be processed until the delay
  // expires.
  // ---------------------------------------------------------------
  async sendReminder(taskId: string, taskTitle: string, delayMs: number) {
    const job = await this.notificationQueue.add(
      'task-reminder',
      {
        taskId,
        taskTitle,
        type: 'reminder',
        timestamp: new Date().toISOString(),
      },
      {
        delay: delayMs,
      },
    );

    console.log(
      `[Producer] Queued 'task-reminder' job ${job.id} for task: ${taskTitle} ` +
      `(fires in ${delayMs / 1000}s)`,
    );
    return job;
  }
}