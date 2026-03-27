// ---------------------------------------------------------------
// TASKS SERVICE — UNIT TEST SUITE
//
// This demonstrates the standard NestJS unit testing pattern:
//   1. Create a testing module with Test.createTestingModule()
//   2. Replace all dependencies with mocks
//   3. Get the service instance from the compiled module
//   4. Test each method by configuring mocks and checking results
//
// WHAT WE'RE TESTING:
//   - TasksService methods (create, findAll, findOne, update, remove)
//   - That the service calls the repository correctly
//   - That the service calls notifications at the right times
//   - That the service throws proper exceptions
//
// WHAT WE'RE MOCKING:
//   - TaskRepository (no real database)
//   - NotificationsService (no real BullMQ queue)
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService, TASK_REPOSITORY } from '../src/tasks.service';
import { NotificationsService } from '../src/notifications.service';
import { Task } from '../src/task.types';

describe('TasksService', () => {
  // ---------------------------------------------------------------
  // These variables are shared across all tests in this describe
  // block. They're reassigned in beforeEach so each test gets
  // fresh instances.
  // ---------------------------------------------------------------
  let service: TasksService;
  let mockRepository: Record<string, jest.Mock>;
  let mockNotifications: Record<string, jest.Mock>;

  // ---------------------------------------------------------------
  // BEFORE EACH — Build the Testing Module
  //
  // This runs before EVERY test. It:
  //   1. Creates fresh mock objects (so no test leaks into another)
  //   2. Builds a NestJS testing module with those mocks
  //   3. Compiles the module (wires up dependency injection)
  //   4. Extracts the service instance for testing
  // ---------------------------------------------------------------
  beforeEach(async () => {
    // Fresh mocks for each test
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    mockNotifications = {
      sendTaskCreatedNotification: jest.fn().mockResolvedValue(undefined),
      sendTaskCompletedNotification: jest.fn().mockResolvedValue(undefined),
      sendReminder: jest.fn().mockResolvedValue(undefined),
    };

    // ---------------------------------------------------------------
    // Test.createTestingModule() — the core of NestJS testing
    //
    // This creates a mini NestJS dependency injection container.
    // We list TasksService as a real provider, but replace its
    // dependencies (repository and notifications) with mocks.
    //
    // { provide: TASK_REPOSITORY, useValue: mockRepository }
    //   means: "When TasksService asks for TASK_REPOSITORY,
    //   give it mockRepository instead of a real database connection."
    // ---------------------------------------------------------------
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TASK_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotifications,
        },
      ],
    }).compile();

    // Extract the service with all mocks wired in
    service = module.get<TasksService>(TasksService);
  });

  // ---------------------------------------------------------------
  // SAMPLE TASK DATA — reusable across tests
  // ---------------------------------------------------------------
  const sampleTask: Task = {
    id: 'uuid-1',
    title: 'Learn NestJS Testing',
    description: 'Write unit tests with mocks',
    completed: false,
    priority: 'high',
  };

  // =================================================================
  // CREATE
  // =================================================================

  describe('create', () => {
    it('saves the task via repository and returns it', async () => {
      // Configure mocks: create builds the object, save persists it
      mockRepository.create.mockReturnValue(sampleTask);
      mockRepository.save.mockResolvedValue(sampleTask);

      const result = await service.create('Learn NestJS Testing', 'Write unit tests with mocks');

      // Check the return value
      expect(result).toEqual(sampleTask);

      // Check that repository.create was called with the right data
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: 'Learn NestJS Testing',
        description: 'Write unit tests with mocks',
      });

      // Check that repository.save was called with what create returned
      expect(mockRepository.save).toHaveBeenCalledWith(sampleTask);
    });

    it('queues a task-created notification', async () => {
      mockRepository.create.mockReturnValue(sampleTask);
      mockRepository.save.mockResolvedValue(sampleTask);

      await service.create('Learn NestJS Testing', 'Write unit tests with mocks');

      expect(mockNotifications.sendTaskCreatedNotification)
        .toHaveBeenCalledWith('uuid-1', 'Learn NestJS Testing');
    });

    it('queues a reminder with 30 second delay', async () => {
      mockRepository.create.mockReturnValue(sampleTask);
      mockRepository.save.mockResolvedValue(sampleTask);

      await service.create('Learn NestJS Testing', 'Write unit tests with mocks');

      expect(mockNotifications.sendReminder)
        .toHaveBeenCalledWith('uuid-1', 'Learn NestJS Testing', 30000);
    });
  });

  // =================================================================
  // FIND ALL
  // =================================================================

  describe('findAll', () => {
    it('returns all tasks from the repository', async () => {
      const tasks = [sampleTask, { ...sampleTask, id: 'uuid-2', title: 'Second task' }];
      mockRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(result).toEqual(tasks);
      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no tasks exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // =================================================================
  // FIND ONE
  // =================================================================

  describe('findOne', () => {
    it('returns the task when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(sampleTask);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(sampleTask);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
    });

    it('throws NotFoundException when task does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('includes the task ID in the error message', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('bad-id'))
        .rejects
        .toThrow('Task "bad-id" not found');
    });
  });

  // =================================================================
  // UPDATE
  // =================================================================

  describe('update', () => {
    it('applies changes and saves via repository', async () => {
      const existingTask = { ...sampleTask, completed: false };
      mockRepository.findOneBy.mockResolvedValue(existingTask);
      mockRepository.save.mockResolvedValue({ ...existingTask, title: 'Updated title' });

      const result = await service.update('uuid-1', { title: 'Updated title' });

      expect(result.title).toBe('Updated title');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('sends completion notification when task is newly completed', async () => {
      const existingTask = { ...sampleTask, completed: false };
      const completedTask = { ...existingTask, completed: true };
      mockRepository.findOneBy.mockResolvedValue(existingTask);
      mockRepository.save.mockResolvedValue(completedTask);

      await service.update('uuid-1', { completed: true });

      expect(mockNotifications.sendTaskCompletedNotification)
        .toHaveBeenCalledWith('uuid-1', 'Learn NestJS Testing');
    });

    it('does NOT send completion notification when task was already completed', async () => {
      const alreadyCompleted = { ...sampleTask, completed: true };
      mockRepository.findOneBy.mockResolvedValue(alreadyCompleted);
      mockRepository.save.mockResolvedValue(alreadyCompleted);

      await service.update('uuid-1', { completed: true });

      expect(mockNotifications.sendTaskCompletedNotification).not.toHaveBeenCalled();
    });

    it('does NOT send completion notification for non-completion updates', async () => {
      const existingTask = { ...sampleTask, completed: false };
      mockRepository.findOneBy.mockResolvedValue(existingTask);
      mockRepository.save.mockResolvedValue({ ...existingTask, title: 'New title' });

      await service.update('uuid-1', { title: 'New title' });

      expect(mockNotifications.sendTaskCompletedNotification).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when updating a nonexistent task', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update('nonexistent', { title: 'Nope' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  // =================================================================
  // REMOVE
  // =================================================================

  describe('remove', () => {
    it('deletes the task and returns a confirmation message', async () => {
      mockRepository.findOneBy.mockResolvedValue(sampleTask);
      mockRepository.remove.mockResolvedValue(sampleTask);

      const result = await service.remove('uuid-1');

      expect(result).toEqual({ message: 'Task "Learn NestJS Testing" deleted' });
      expect(mockRepository.remove).toHaveBeenCalledWith(sampleTask);
    });

    it('throws NotFoundException when deleting a nonexistent task', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('nonexistent'))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});
