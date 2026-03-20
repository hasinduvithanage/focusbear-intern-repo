import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

// ---------------------------------------------------------------
// STRUCTURED LOGGING IN A SERVICE
//
// Instead of console.log(), inject PinoLogger and use its methods.
// Each log is a JSON object with consistent fields.
//
// logger.info({ taskId: '123' }, 'Task created')
// Outputs: {"level":"info","taskId":"123","msg":"Task created","time":...}
//
// The first argument is a context object (any key-value pairs you
// want attached to the log). The second is the message string.
// This structure makes logs searchable — you can filter by taskId
// across millions of log lines.
// ---------------------------------------------------------------

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly notificationsService: NotificationsService,

    // Inject Pino logger with a context name
    // All logs from this service will include "context":"TasksService"
    @InjectPinoLogger(TasksService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(title: string, description: string): Promise<Task> {
    this.logger.info({ title }, 'Creating new task');

    const task = this.taskRepository.create({ title, description });
    const saved = await this.taskRepository.save(task);

    this.logger.info({ taskId: saved.id, title: saved.title }, 'Task created successfully');

    await this.notificationsService.sendTaskCreatedNotification(saved.id, saved.title);
    await this.notificationsService.sendReminder(saved.id, saved.title, 30000);

    return saved;
  }

  async findAll(): Promise<Task[]> {
    this.logger.debug('Fetching all tasks');
    const tasks = await this.taskRepository.find();
    this.logger.debug({ count: tasks.length }, 'Tasks retrieved');
    return tasks;
  }

  async findOne(id: string): Promise<Task> {
    this.logger.debug({ taskId: id }, 'Fetching task by ID');

    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      // Log the failed lookup as a warning before throwing
      this.logger.warn({ taskId: id }, 'Task not found');
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

    Object.assign(task, data);
    const updated = await this.taskRepository.save(task);

    this.logger.info({ taskId: updated.id, changes: data }, 'Task updated');

    if (justCompleted) {
      this.logger.info({ taskId: updated.id }, 'Task marked as completed, queuing notification');
      await this.notificationsService.sendTaskCompletedNotification(updated.id, updated.title);
    }

    return updated;
  }

  async remove(id: string): Promise<{ message: string }> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);

    this.logger.info({ taskId: id, title: task.title }, 'Task deleted');
    return { message: `Task "${task.title}" deleted` };
  }
}