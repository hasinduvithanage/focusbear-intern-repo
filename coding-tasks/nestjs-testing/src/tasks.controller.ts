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

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Permissions('create:tasks')
  create(@Body() body: { title: string; description: string }) {
    return this.tasksService.create(body.title, body.description);
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
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; completed?: boolean },
  ) {
    return this.tasksService.update(id, body);
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
