import { Injectable, NotFoundException } from '@nestjs/common';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

@Injectable()
export class TasksService {
  private tasks: any[] = [];

  create(title: string, description: string) {
    const task = {
      id: Date.now().toString(),
      title,
      description,
      completed: false,
    };
    this.tasks.push(task);
    return task;
  }

  findAll() {
    return this.tasks;
  }

  findOne(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`Task "${id}" not found`);
    return task;
  }

  update(id: string, data: { title?: string; description?: string; completed?: boolean }) {
    const task = this.findOne(id);
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.completed !== undefined) task.completed = data.completed;
    return task;
  }

  remove(id: string) {
    const task = this.findOne(id);
    this.tasks = this.tasks.filter((t) => t.id !== task.id);
    return { message: `Task "${task.title}" deleted` };
  }
}