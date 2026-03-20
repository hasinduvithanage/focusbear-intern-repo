import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

// ---------------------------------------------------------------
// TASKS CONTROLLER — Now protected with Auth0 RBAC
//
// TWO LAYERS of guards on every endpoint:
//
//   1. JwtAuthGuard — "Is the user logged in with a valid token?"
//      If no token or invalid token → 401 Unauthorized
//
//   2. PermissionsGuard — "Does the user have the right permissions?"
//      Reads @Permissions() decorator, checks against token.
//      If insufficient permissions → 403 Forbidden
//
// The guards run in order. JwtAuthGuard MUST run first because
// PermissionsGuard needs request.user (set by JwtStrategy).
//
// PERMISSION MAPPING:
//   POST   /tasks       → create:tasks
//   GET    /tasks       → read:tasks
//   GET    /tasks/:id   → read:tasks
//   PUT    /tasks/:id   → update:tasks
//   DELETE /tasks/:id   → delete:tasks  (admin only)
// ---------------------------------------------------------------

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard) // Apply to ALL endpoints in this controller
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // POST /tasks — requires 'create:tasks' permission
  @Post()
  @Permissions('create:tasks')
  create(@Body() body: { title: string; description: string }) {
    return this.tasksService.create(body.title, body.description);
  }

  // GET /tasks — requires 'read:tasks' permission
  @Get()
  @Permissions('read:tasks')
  findAll() {
    return this.tasksService.findAll();
  }

  // GET /tasks/:id — requires 'read:tasks' permission
  @Get(':id')
  @Permissions('read:tasks')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // PUT /tasks/:id — requires 'update:tasks' permission
  @Put(':id')
  @Permissions('update:tasks')
  update(
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; completed?: boolean },
  ) {
    return this.tasksService.update(id, body);
  }

  // DELETE /tasks/:id — requires 'delete:tasks' permission (admin only)
  @Delete(':id')
  @Permissions('delete:tasks')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  // ---------------------------------------------------------------
  // BONUS: An endpoint to see your own token info (useful for debugging)
  //
  // No @Permissions() decorator — any authenticated user can access
  // this. The PermissionsGuard sees no required permissions and
  // returns true (pass-through).
  // ---------------------------------------------------------------
  @Get('auth/me')
  getProfile(@Request() req: any) {
    return {
      userId: req.user.userId,
      permissions: req.user.permissions,
      message: 'This is your decoded Auth0 token info',
    };
  }
}