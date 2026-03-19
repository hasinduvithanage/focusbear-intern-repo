import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // POST /tasks
  @Post()
  create(@Body() body: { title: string; description: string }) {
    return this.tasksService.create(body.title, body.description);
  }

  // GET /tasks
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  // GET /tasks/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // PUT /tasks/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; description?: string; completed?: boolean }) {
    return this.tasksService.update(id, body);
  }

  // DELETE /tasks/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}