import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

// ---------------------------------------------------------------
// CONSUMER (PROCESSOR) — Processes jobs from the 'notifications' queue.
//
// This class extends WorkerHost and is decorated with @Processor().
// BullMQ automatically creates a worker that pulls jobs from Redis
// and calls the process() method for each one.
//
// The queue name in @Processor() MUST match the name used in
// registerQueue() and @InjectQueue().
//
// KEY CONCEPT: This code runs in the BACKGROUND, not during an
// HTTP request. When a user creates a task via POST /tasks, the
// API returns immediately. This processor picks up the notification
// job seconds later (or whenever it's free) and does the slow work.
// ---------------------------------------------------------------

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  // ---------------------------------------------------------------
  // process() is called for EVERY job in the queue.
  // Route to different logic based on job.name.
  // ---------------------------------------------------------------
  async process(job: Job): Promise<any> {
    this.logger.log(
      `[Worker] Processing job ${job.id} | type: ${job.name} | attempt: ${job.attemptsMade + 1}`,
    );

    switch (job.name) {
      case 'task-created':
        return this.handleTaskCreated(job);

      case 'task-completed':
        return this.handleTaskCompleted(job);

      case 'task-reminder':
        return this.handleTaskReminder(job);

      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  // ---------------------------------------------------------------
  // Handler for 'task-created' jobs
  // In production: send a push notification, email, or Slack message
  // ---------------------------------------------------------------
  private async handleTaskCreated(job: Job) {
    const { taskId, taskTitle } = job.data;

    // Simulate slow work (e.g., calling an external notification API)
    await this.simulateWork(1000);

    this.logger.log(
      `[Worker] Sent 'task created' notification for: "${taskTitle}" (id: ${taskId})`,
    );

    return { success: true, notificationType: 'task-created' };
  }

  // ---------------------------------------------------------------
  // Handler for 'task-completed' jobs
  // In production: update streaks, send congratulations, etc.
  // ---------------------------------------------------------------
  private async handleTaskCompleted(job: Job) {
    const { taskId, taskTitle } = job.data;

    await this.simulateWork(1500);

    this.logger.log(
      `[Worker] Sent 'task completed' notification for: "${taskTitle}" (id: ${taskId})`,
    );

    return { success: true, notificationType: 'task-completed' };
  }

  // ---------------------------------------------------------------
  // Handler for 'task-reminder' jobs
  // These arrive after a delay — BullMQ held them in the delayed
  // set until the time was right.
  // ---------------------------------------------------------------
  private async handleTaskReminder(job: Job) {
    const { taskId, taskTitle } = job.data;

    await this.simulateWork(500);

    this.logger.log(
      `[Worker] Sent reminder for: "${taskTitle}" (id: ${taskId})`,
    );

    return { success: true, notificationType: 'reminder' };
  }

  // ---------------------------------------------------------------
  // EVENT HOOKS — BullMQ calls these automatically
  // ---------------------------------------------------------------

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `[Worker] Job ${job.id} (${job.name}) completed successfully`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `[Worker] Job ${job.id} (${job.name}) failed: ${error.message}` +
      ` | attempts: ${job.attemptsMade}/${job.opts.attempts}`,
    );
  }

  // ---------------------------------------------------------------
  // Simulates async work (replace with real API calls in production)
  // ---------------------------------------------------------------
  private simulateWork(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}