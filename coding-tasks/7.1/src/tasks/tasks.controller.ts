import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // POST /tasks
  // Before: @Body() body: { title: string; description: string }  ← no runtime validation
  // After:  @Body() body: CreateTaskDto                           ← validated by global pipe
  @Post()
  create(@Body() body: CreateTaskDto) {
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
  // Before: @Body() body: { title?: string; description?: string; completed?: boolean }
  // After:  @Body() body: UpdateTaskDto
  @Put(':id')
  update(@Param('id') id: string, @Body() body: UpdateTaskDto) {
    return this.tasksService.update(id, body);
  }

  // DELETE /tasks/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}