import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { NotificationsService } from '../notifications/notifications.service';

// ---------------------------------------------------------------
// The service now queues background notifications via BullMQ.
//
// When a task is created → queues a 'task-created' notification
//   AND a reminder that fires after 30 seconds (demo purposes)
//
// When a task is marked completed → queues a 'task-completed' notification
//
// The API returns instantly. The notifications are processed
// in the background by NotificationsProcessor.
// ---------------------------------------------------------------

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    // Inject the notification producer
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(title: string, description: string): Promise<Task> {
    const task = this.taskRepository.create({ title, description });
    const saved = await this.taskRepository.save(task);

    // ---------------------------------------------------------------
    // Queue background jobs — these return instantly (just writes to Redis)
    // The processor handles the actual work later
    // ---------------------------------------------------------------

    // 1. Immediate notification: "new task created"
    await this.notificationsService.sendTaskCreatedNotification(
      saved.id,
      saved.title,
    );

    // 2. Delayed reminder: fires after 30 seconds (30000ms)
    //    In production this might be 1 hour or tied to a due date
    await this.notificationsService.sendReminder(
      saved.id,
      saved.title,
      30000,
    );

    return saved;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task "${id}" not found`);
    return task;
  }

  async update(
    id: string,
    data: { title?: string; description?: string; completed?: boolean },
  ): Promise<Task> {
    const task = await this.findOne(id);

    // Check if this update marks the task as completed
    const justCompleted = data.completed === true && !task.completed;

    Object.assign(task, data);
    const updated = await this.taskRepository.save(task);

    // Queue a notification only when the task transitions to completed
    if (justCompleted) {
      await this.notificationsService.sendTaskCompletedNotification(
        updated.id,
        updated.title,
      );
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
    return { message: `Task "${task.title}" deleted` };
  }
}