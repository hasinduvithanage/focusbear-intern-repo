// ---------------------------------------------------------------
// TASKS CONTROLLER — Updated with DTOs
//
// Now uses CreateTaskDto and UpdateTaskDto instead of raw @Body().
// This means the global ValidationPipe will validate incoming
// requests against the DTO decorators before they reach the
// handler method.
// ---------------------------------------------------------------

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';
import { Permissions } from './permissions.decorator';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Permissions('create:tasks')
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto.title, dto.description);
  }

  @Get()
  @Permissions('read:tasks')
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @Permissions('read:tasks')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  @Permissions('update:tasks')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('delete:tasks')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Get('auth/me')
  getProfile(@Request() req: any) {
    return {
      userId: req.user.userId,
      permissions: req.user.permissions,
    };
  }
}