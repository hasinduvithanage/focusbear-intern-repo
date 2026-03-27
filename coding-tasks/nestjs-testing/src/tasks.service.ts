// ---------------------------------------------------------------
// TASKS SERVICE
//
// This mirrors your 7.1 TasksService with the same methods and
// logic, but uses constructor injection with tokens instead of
// TypeORM decorators so it runs without a database.
//
// The testing approach is identical to what you'd use with the
// real TypeORM repository — mock the methods, test the logic.
// ---------------------------------------------------------------

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Task, TaskRepository } from './task.types';
import { NotificationsService } from './notifications.service';

// Injection token — in real 7.1 project, getRepositoryToken(Task) provides this
export const TASK_REPOSITORY = 'TASK_REPOSITORY';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: TaskRepository,

    private readonly notificationsService: NotificationsService,
  ) {}

  async create(title: string, description: string): Promise<Task> {
    const task = this.taskRepository.create({ title, description });
    const saved = await this.taskRepository.save(task);

    // Queue background notifications
    await this.notificationsService.sendTaskCreatedNotification(saved.id, saved.title);
    await this.notificationsService.sendReminder(saved.id, saved.title, 30000);

    return saved;
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task "${id}" not found`);
    }
    return task;
  }

  async update(
    id: string,
    data: { title?: string; description?: string; completed?: boolean },
  ): Promise<Task> {
    const task = await this.findOne(id);
    const justCompleted = data.completed === true && !task.completed;

    // Apply changes
    Object.assign(task, data);
    const updated = await this.taskRepository.save(task);

    // Only notify if task was just marked complete (not if already complete)
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
