import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  // CREATE — insert a new row
  async create(title: string, description: string): Promise<Task> {
    const task = this.taskRepo.create({ title, description });
    return this.taskRepo.save(task);
  }

  // READ ALL — get every row from the tasks table
  async findAll(): Promise<Task[]> {
    return this.taskRepo.find();
  }

  // READ ONE — get a single row by its id
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) {
      throw new NotFoundException(`Task "${id}" not found`);
    }
    return task;
  }

  // UPDATE — change specific fields on an existing row
  async update(
    id: string,
    data: { title?: string; description?: string; completed?: boolean },
  ): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, data);
    return this.taskRepo.save(task);
  }

  // DELETE — remove a row from the table
  async remove(id: string): Promise<{ message: string }> {
    const task = await this.findOne(id);
    await this.taskRepo.remove(task);
    return { message: `Task "${task.title}" deleted` };
  }
}