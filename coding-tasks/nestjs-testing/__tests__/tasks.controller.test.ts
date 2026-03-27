// ---------------------------------------------------------------
// TASKS CONTROLLER — UNIT TEST SUITE
//
// Testing a controller is about verifying the ROUTING LAYER:
//   - Does each method call the right service method?
//   - Does it pass the right arguments from the request?
//   - Does it return whatever the service gives back?
//
// Controllers should be thin — if these tests get complicated,
// it means the controller has too much logic that should be
// in the service instead.
//
// MOCKING STRATEGY:
//   - TasksService: fully mocked (we're testing the controller, not the service)
//   - JwtAuthGuard: overridden to always allow (we're not testing auth here)
//   - PermissionsGuard: overridden to always allow (tested separately)
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../src/tasks.controller';
import { TasksService } from '../src/tasks.service';
import { JwtAuthGuard } from '../src/jwt-auth.guard';
import { PermissionsGuard } from '../src/permissions.guard';
import { Task } from '../src/task.types';

describe('TasksController', () => {
  let controller: TasksController;
  let mockService: Record<string, jest.Mock>;

  // ---------------------------------------------------------------
  // SAMPLE DATA
  // ---------------------------------------------------------------

  const sampleTask: Task = {
    id: 'uuid-1',
    title: 'Test Task',
    description: 'A task for testing',
    completed: false,
    priority: 'medium',
  };

  // ---------------------------------------------------------------
  // SETUP — Build testing module before each test
  //
  // Key points:
  //   1. TasksController is real (it's what we're testing)
  //   2. TasksService is mocked (we don't want real business logic)
  //   3. Both guards are overridden to always return true
  //      so we can test routing without auth
  // ---------------------------------------------------------------

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockService,
        },
      ],
    })
      // ---------------------------------------------------------------
      // .overrideGuard() — NestJS testing utility
      //
      // This replaces the real guard with a fake that always allows
      // access. Without this, the guard would try to validate a JWT
      // token that doesn't exist in our test, and every test would
      // get a 401 before reaching the controller method.
      // ---------------------------------------------------------------
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  // =================================================================
  // CREATE — POST /tasks
  // =================================================================

  describe('create', () => {
    it('calls service.create with title and description from body', async () => {
      mockService.create.mockResolvedValue(sampleTask);

      const body = { title: 'Test Task', description: 'A task for testing' };
      const result = await controller.create(body);

      // Verify service was called with the right arguments
      expect(mockService.create).toHaveBeenCalledWith('Test Task', 'A task for testing');
      expect(mockService.create).toHaveBeenCalledTimes(1);

      // Verify controller returns what the service returned
      expect(result).toEqual(sampleTask);
    });

    it('passes through service errors to the caller', async () => {
      mockService.create.mockRejectedValue(new Error('Database error'));

      await expect(
        controller.create({ title: 'Fail', description: 'Error test' }),
      ).rejects.toThrow('Database error');
    });
  });

  // =================================================================
  // FIND ALL — GET /tasks
  // =================================================================

  describe('findAll', () => {
    it('returns all tasks from the service', async () => {
      const tasks = [sampleTask, { ...sampleTask, id: 'uuid-2', title: 'Second' }];
      mockService.findAll.mockResolvedValue(tasks);

      const result = await controller.findAll();

      expect(result).toEqual(tasks);
      expect(result).toHaveLength(2);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no tasks exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // =================================================================
  // FIND ONE — GET /tasks/:id
  // =================================================================

  describe('findOne', () => {
    it('passes the id param to service.findOne', async () => {
      mockService.findOne.mockResolvedValue(sampleTask);

      const result = await controller.findOne('uuid-1');

      expect(mockService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(sampleTask);
    });

    it('propagates NotFoundException from service', async () => {
      mockService.findOne.mockRejectedValue(
        new Error('Task "nonexistent" not found'),
      );

      await expect(controller.findOne('nonexistent')).rejects.toThrow(
        'Task "nonexistent" not found',
      );
    });
  });

  // =================================================================
  // UPDATE — PUT /tasks/:id
  // =================================================================

  describe('update', () => {
    it('passes id and body to service.update', async () => {
      const updatedTask = { ...sampleTask, title: 'Updated Title' };
      mockService.update.mockResolvedValue(updatedTask);

      const body = { title: 'Updated Title' };
      const result = await controller.update('uuid-1', body);

      expect(mockService.update).toHaveBeenCalledWith('uuid-1', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('handles completion updates', async () => {
      const completedTask = { ...sampleTask, completed: true };
      mockService.update.mockResolvedValue(completedTask);

      const result = await controller.update('uuid-1', { completed: true });

      expect(mockService.update).toHaveBeenCalledWith('uuid-1', { completed: true });
      expect(result.completed).toBe(true);
    });
  });

  // =================================================================
  // REMOVE — DELETE /tasks/:id
  // =================================================================

  describe('remove', () => {
    it('passes id to service.remove and returns confirmation', async () => {
      const confirmation = { message: 'Task "Test Task" deleted' };
      mockService.remove.mockResolvedValue(confirmation);

      const result = await controller.remove('uuid-1');

      expect(mockService.remove).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(confirmation);
    });
  });

  // =================================================================
  // GET PROFILE — GET /tasks/auth/me
  // =================================================================

  describe('getProfile', () => {
    it('returns user info from the request object', () => {
      // ---------------------------------------------------------------
      // For this endpoint, we create a mock request object that
      // mimics what JwtAuthGuard would attach to the request.
      // In production, request.user is set by passport-jwt after
      // validating the Auth0 token.
      // ---------------------------------------------------------------
      const mockRequest = {
        user: {
          userId: 'auth0|12345',
          permissions: ['read:tasks', 'create:tasks'],
        },
      };

      const result = controller.getProfile(mockRequest);

      expect(result).toEqual({
        userId: 'auth0|12345',
        permissions: ['read:tasks', 'create:tasks'],
      });
    });
  });
});
