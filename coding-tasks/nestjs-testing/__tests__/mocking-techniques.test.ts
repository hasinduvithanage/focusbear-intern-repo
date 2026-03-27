// ---------------------------------------------------------------
// MOCKING TECHNIQUES — COMPREHENSIVE TEST SUITE
//
// This file demonstrates THREE mocking approaches side by side:
//
//   1. MOCKING A SERVICE INSIDE A CONTROLLER TEST
//      → { provide: TasksService, useValue: mockService }
//      → The controller gets a fake service via NestJS DI
//
//   2. MOCKING A DATABASE REPOSITORY IN A SERVICE TEST
//      → { provide: TASK_REPOSITORY, useValue: mockRepository }
//      → The service gets a fake repository via NestJS DI
//
//   3. jest.fn() vs jest.spyOn() vs jest.mock()
//      → jest.fn()    — create a standalone fake function
//      → jest.spyOn() — wrap a REAL method to observe/override it
//      → jest.mock()  — replace an entire imported module
//
// All three are valid. The choice depends on whether the
// dependency is injected (use NestJS DI) or directly imported
// (use jest.mock), and whether you want to replace the behaviour
// entirely (jest.fn/mock) or just observe it (jest.spyOn).
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksController } from '../src/tasks.controller';
import { TasksService, TASK_REPOSITORY } from '../src/tasks.service';
import { NotificationsService } from '../src/notifications.service';
import { JwtAuthGuard } from '../src/jwt-auth.guard';
import { PermissionsGuard } from '../src/permissions.guard';
import { Task } from '../src/task.types';
import * as taskUtils from '../src/task.utils';

// ---------------------------------------------------------------
// jest.mock() — MODULE-LEVEL REPLACEMENT
//
// This replaces EVERY export from task.utils.ts with jest.fn().
// The real generateTaskSummary and calculatePriorityScore never
// run — they're completely replaced.
//
// Use this when the code under test imports a module directly
// (not through NestJS DI) and you want full control.
//
// Must be at the top level — Jest hoists it above imports.
// ---------------------------------------------------------------
jest.mock('../src/task.utils');

const mockedGenerateSummary = taskUtils.generateTaskSummary as jest.MockedFunction<
  typeof taskUtils.generateTaskSummary
>;
const mockedCalcScore = taskUtils.calculatePriorityScore as jest.MockedFunction<
  typeof taskUtils.calculatePriorityScore
>;

// ---------------------------------------------------------------
// SHARED TEST DATA
// ---------------------------------------------------------------

const sampleTask: Task = {
  id: 'uuid-1',
  title: 'Learn Mocking',
  description: 'Master all three techniques',
  completed: false,
  priority: 'high',
};

const completedTask: Task = {
  id: 'uuid-2',
  title: 'Previous Task',
  description: 'Already done',
  completed: true,
  priority: 'low',
};

// =================================================================
// PART 1: MOCKING A SERVICE INSIDE A CONTROLLER TEST
//
// The controller depends on TasksService.
// We replace it with an object of jest.fn() methods.
// The controller calls mockService.create(), gets back whatever
// we configured, and we verify the right method was called.
// =================================================================

describe('Part 1: Mocking a service in a controller test', () => {
  let controller: TasksController;
  let mockService: Record<string, jest.Mock>;

  beforeEach(async () => {
    // ---------------------------------------------------------------
    // Create a mock for every service method the controller uses.
    // Each mock starts as a no-op function — we configure return
    // values in each individual test.
    // ---------------------------------------------------------------
    mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getSummary: jest.fn(),
      getTotalPriorityScore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        // ---------------------------------------------------------------
        // { provide: TasksService, useValue: mockService }
        //
        // This tells NestJS: "When TasksController asks for TasksService
        // in its constructor, give it mockService instead."
        //
        // The controller has no idea it's talking to a fake. It calls
        // this.tasksService.create() and our mock handles it.
        // ---------------------------------------------------------------
        {
          provide: TasksService,
          useValue: mockService,
        },
      ],
    })
      // Skip auth guards — we're testing routing, not authorization
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('create() calls service.create and returns the result', async () => {
    mockService.create.mockResolvedValue(sampleTask);

    const result = await controller.create({
      title: 'Learn Mocking',
      description: 'Master all three techniques',
    });

    expect(result).toEqual(sampleTask);
    expect(mockService.create).toHaveBeenCalledWith(
      'Learn Mocking',
      'Master all three techniques',
    );
  });

  it('findAll() returns whatever the service returns', async () => {
    const tasks = [sampleTask, completedTask];
    mockService.findAll.mockResolvedValue(tasks);

    const result = await controller.findAll();

    expect(result).toHaveLength(2);
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne() passes the ID from the URL param', async () => {
    mockService.findOne.mockResolvedValue(sampleTask);

    const result = await controller.findOne('uuid-1');

    expect(mockService.findOne).toHaveBeenCalledWith('uuid-1');
    expect(result.title).toBe('Learn Mocking');
  });

  it('controller passes through service exceptions unchanged', async () => {
    // ---------------------------------------------------------------
    // When the service throws, the controller should let it bubble up.
    // NestJS's exception filter (AllExceptionsFilter) handles it.
    // The controller should NOT catch and re-wrap errors.
    // ---------------------------------------------------------------
    mockService.findOne.mockRejectedValue(
      new NotFoundException('Task "bad-id" not found'),
    );

    await expect(controller.findOne('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('update() passes both ID and body to the service', async () => {
    const updated = { ...sampleTask, completed: true };
    mockService.update.mockResolvedValue(updated);

    const result = await controller.update('uuid-1', { completed: true });

    expect(mockService.update).toHaveBeenCalledWith('uuid-1', { completed: true });
    expect(result.completed).toBe(true);
  });

  it('remove() passes ID and returns the confirmation message', async () => {
    mockService.remove.mockResolvedValue({ message: 'Task "Learn Mocking" deleted' });

    const result = await controller.remove('uuid-1');

    expect(mockService.remove).toHaveBeenCalledWith('uuid-1');
    expect(result.message).toContain('Learn Mocking');
  });
});

// =================================================================
// PART 2: MOCKING A DATABASE REPOSITORY IN A SERVICE TEST
//
// The service depends on a TaskRepository (TypeORM in production).
// We mock every repository method the service calls.
// This lets us simulate any database scenario — found, not found,
// error, empty table — without a real database.
// =================================================================

describe('Part 2: Mocking a repository in a service test', () => {
  let service: TasksService;
  let mockRepository: Record<string, jest.Mock>;
  let mockNotifications: Record<string, jest.Mock>;

  beforeEach(async () => {
    // ---------------------------------------------------------------
    // Mock every repository method the service uses.
    //
    // IMPORTANT: create() is SYNCHRONOUS in TypeORM — use mockReturnValue.
    //            save(), find(), findOneBy(), remove() are ASYNC — use mockResolvedValue.
    //
    // Getting sync vs async wrong is a common bug:
    //   - mockReturnValue for create() (returns plain object)
    //   - mockResolvedValue for save() (returns Promise<Task>)
    // ---------------------------------------------------------------
    mockRepository = {
      create: jest.fn(),   // sync — builds entity, doesn't touch DB
      save: jest.fn(),     // async — persists to DB, returns saved entity
      find: jest.fn(),     // async — queries DB, returns array
      findOneBy: jest.fn(), // async — queries DB, returns entity or null
      remove: jest.fn(),   // async — deletes from DB
    };

    mockNotifications = {
      sendTaskCreatedNotification: jest.fn().mockResolvedValue(undefined),
      sendTaskCompletedNotification: jest.fn().mockResolvedValue(undefined),
      sendReminder: jest.fn().mockResolvedValue(undefined),
    };

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

    service = module.get<TasksService>(TasksService);

    // Reset the jest.mock() mocks too (from Part 3)
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // SIMULATING: Successful save (create + save pattern)
  // ---------------------------------------------------------------
  it('create: passes data through repository.create then repository.save', async () => {
    const unsaved = { title: 'New', description: 'Desc' } as Task;
    const saved = { ...sampleTask };

    // create() is SYNC — mockReturnValue (not mockResolvedValue)
    mockRepository.create.mockReturnValue(unsaved);
    // save() is ASYNC — mockResolvedValue
    mockRepository.save.mockResolvedValue(saved);

    const result = await service.create('New', 'Desc');

    expect(mockRepository.create).toHaveBeenCalledWith({
      title: 'New',
      description: 'Desc',
    });
    expect(mockRepository.save).toHaveBeenCalledWith(unsaved);
    expect(result.id).toBe('uuid-1');
  });

  // ---------------------------------------------------------------
  // SIMULATING: Record found
  // ---------------------------------------------------------------
  it('findOne: returns task when repository finds a match', async () => {
    mockRepository.findOneBy.mockResolvedValue(sampleTask);

    const result = await service.findOne('uuid-1');

    expect(result).toEqual(sampleTask);
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
  });

  // ---------------------------------------------------------------
  // SIMULATING: Record not found (null from DB)
  // ---------------------------------------------------------------
  it('findOne: throws NotFoundException when repository returns null', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('ghost')).rejects.toThrow(NotFoundException);
    await expect(service.findOne('ghost')).rejects.toThrow('"ghost"');
  });

  // ---------------------------------------------------------------
  // SIMULATING: Empty table
  // ---------------------------------------------------------------
  it('findAll: returns empty array for empty table', async () => {
    mockRepository.find.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  // ---------------------------------------------------------------
  // SIMULATING: Database error
  // ---------------------------------------------------------------
  it('create: propagates database errors', async () => {
    mockRepository.create.mockReturnValue({} as Task);
    mockRepository.save.mockRejectedValue(
      new Error('unique constraint violation'),
    );

    await expect(service.create('Dup', 'Desc')).rejects.toThrow(
      'unique constraint violation',
    );
  });

  // ---------------------------------------------------------------
  // SIMULATING: Conditional notification on state transition
  // ---------------------------------------------------------------
  it('update: sends notification ONLY when task transitions to completed', async () => {
    const existing = { ...sampleTask, completed: false };
    const updated = { ...existing, completed: true };

    mockRepository.findOneBy.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(updated);

    await service.update('uuid-1', { completed: true });

    expect(mockNotifications.sendTaskCompletedNotification)
      .toHaveBeenCalledWith('uuid-1', 'Learn Mocking');
  });

  it('update: does NOT send notification when already completed', async () => {
    const alreadyDone = { ...sampleTask, completed: true };

    mockRepository.findOneBy.mockResolvedValue(alreadyDone);
    mockRepository.save.mockResolvedValue(alreadyDone);

    await service.update('uuid-1', { completed: true });

    expect(mockNotifications.sendTaskCompletedNotification).not.toHaveBeenCalled();
  });
});

// =================================================================
// PART 3: jest.fn() vs jest.spyOn() vs jest.mock()
//
// Three different tools for three different situations.
// This section demonstrates each with real examples.
// =================================================================

describe('Part 3: jest.fn() vs jest.spyOn() vs jest.mock()', () => {
  let service: TasksService;
  let mockRepository: Record<string, jest.Mock>;
  let mockNotifications: Record<string, jest.Mock>;

  beforeEach(async () => {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TASK_REPOSITORY, useValue: mockRepository },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);

    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------
  // jest.fn() — CREATE A BRAND NEW FAKE FUNCTION
  //
  // Use when: you need a standalone mock to pass into code,
  // or to build mock objects for NestJS providers.
  //
  // What it does: creates a function from scratch. It doesn't
  // wrap or replace anything — it IS the mock.
  //
  // This is what we've been using throughout for mockRepository
  // and mockNotifications.
  // ---------------------------------------------------------------

  describe('jest.fn() — standalone mock functions', () => {
    it('creates a function you can configure and inspect', () => {
      // Create a standalone mock
      const mockCallback = jest.fn();

      // It does nothing by default (returns undefined)
      expect(mockCallback()).toBeUndefined();

      // Configure it to return a value
      mockCallback.mockReturnValue(42);
      expect(mockCallback()).toBe(42);

      // Check how it was called
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });

    it('is what we use for NestJS provider mocks', () => {
      // mockRepository.findOneBy IS a jest.fn()
      mockRepository.findOneBy.mockResolvedValue(sampleTask);

      // We can check it was called with specific args
      service.findOne('uuid-1');
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-1' });
    });

    it('can mock callbacks passed as props or arguments', () => {
      // Common React pattern: pass jest.fn() as a callback prop
      const onComplete = jest.fn();

      // Simulate something calling the callback
      onComplete('task-id-123');

      expect(onComplete).toHaveBeenCalledWith('task-id-123');
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------
  // jest.spyOn() — WRAP A REAL METHOD TO WATCH OR OVERRIDE IT
  //
  // Use when: you want to observe how a real method is called
  // WITHOUT replacing it entirely, OR when you want to temporarily
  // override a method but restore the original later.
  //
  // Key difference from jest.fn():
  //   - jest.fn() creates a NEW function
  //   - jest.spyOn() wraps an EXISTING function
  //   - The original can still run (unless you mockImplementation)
  //
  // When to choose spyOn over fn:
  //   - You want the real logic to run but need to verify it was called
  //   - You want to temporarily override one method on a real object
  //   - You need to restore the original after the test
  // ---------------------------------------------------------------

  describe('jest.spyOn() — observing/overriding real methods', () => {
    it('observes calls to a real function without changing behaviour', () => {
      // ---------------------------------------------------------------
      // Spy on the REAL calculatePriorityScore function.
      // But wait — we already jest.mock()'d the module above.
      // So let's demonstrate with a plain object instead.
      // ---------------------------------------------------------------
      const calculator = {
        add: (a: number, b: number) => a + b,
        multiply: (a: number, b: number) => a * b,
      };

      // Spy WITHOUT replacing — the real function still runs
      const addSpy = jest.spyOn(calculator, 'add');

      const result = calculator.add(3, 4);

      // The real function ran and returned the real result
      expect(result).toBe(7);
      // But we can also check HOW it was called
      expect(addSpy).toHaveBeenCalledWith(3, 4);
      expect(addSpy).toHaveBeenCalledTimes(1);

      // Clean up — restore the original (good practice)
      addSpy.mockRestore();
    });

    it('can temporarily override a real method', () => {
      const calculator = {
        add: (a: number, b: number) => a + b,
      };

      // Override the real method with fake behaviour
      const spy = jest.spyOn(calculator, 'add').mockReturnValue(999);

      // Now the spy returns our fake value, not the real calculation
      expect(calculator.add(1, 2)).toBe(999);
      expect(spy).toHaveBeenCalledWith(1, 2);

      // Restore the original
      spy.mockRestore();

      // Real behaviour is back
      expect(calculator.add(1, 2)).toBe(3);
    });

    it('can spy on a service method to verify internal calls', async () => {
      // ---------------------------------------------------------------
      // Spy on service.findOne to verify that update() calls it.
      //
      // We know update() internally calls this.findOne(id).
      // A spy lets us verify this internal call happened
      // while still using the real (mocked-repo) logic.
      // ---------------------------------------------------------------
      mockRepository.findOneBy.mockResolvedValue({ ...sampleTask });
      mockRepository.save.mockResolvedValue({ ...sampleTask, title: 'Updated' });

      const findOneSpy = jest.spyOn(service, 'findOne');

      await service.update('uuid-1', { title: 'Updated' });

      // Verify update() internally called findOne()
      expect(findOneSpy).toHaveBeenCalledWith('uuid-1');

      findOneSpy.mockRestore();
    });

    it('can spy on a prototype method to track all instances', () => {
      // ---------------------------------------------------------------
      // Spying on NotificationsService.prototype would affect ALL
      // instances. Useful for verifying behaviour across the DI system.
      // (We don't do this often, but it's good to know it exists.)
      // ---------------------------------------------------------------
      const spy = jest.spyOn(
        NotificationsService.prototype,
        'sendTaskCreatedNotification',
      );

      // Note: this spy is on the prototype, not our mock instance.
      // In practice, our mock instance (from the DI container) is
      // what gets called. This is just to show the capability.

      spy.mockRestore();
    });
  });

  // ---------------------------------------------------------------
  // jest.mock() — REPLACE AN ENTIRE IMPORTED MODULE
  //
  // Use when: the code under test imports a dependency directly
  // (not through NestJS DI), and you want to replace ALL its
  // exports with mocks.
  //
  // In this project, TasksService imports from './task.utils':
  //   import { generateTaskSummary, calculatePriorityScore } from './task.utils';
  //
  // We can't replace these via NestJS providers because they're
  // not @Injectable() services. jest.mock() is the only option.
  //
  // The jest.mock('../src/task.utils') call at the top of this
  // file already replaced both functions with jest.fn().
  // ---------------------------------------------------------------

  describe('jest.mock() — replacing directly imported modules', () => {
    it('replaces generateTaskSummary with a controllable mock', async () => {
      // Configure the mock to return a specific value
      mockedGenerateSummary.mockReturnValue('[PENDING] Learn Mocking');

      // Set up repository to return a task
      mockRepository.findOneBy.mockResolvedValue(sampleTask);

      const result = await service.getSummary('uuid-1');

      // The mock was called instead of the real function
      expect(mockedGenerateSummary).toHaveBeenCalledWith('Learn Mocking', false);
      expect(result).toBe('[PENDING] Learn Mocking');
    });

    it('replaces calculatePriorityScore for getTotalPriorityScore', async () => {
      // Two tasks: the mock will be called twice
      mockRepository.find.mockResolvedValue([sampleTask, completedTask]);

      // Configure: return 10 for first call, 0 for second
      mockedCalcScore
        .mockReturnValueOnce(10)   // high priority, not completed
        .mockReturnValueOnce(0);   // low priority, completed

      const result = await service.getTotalPriorityScore();

      expect(result).toBe(10);
      expect(mockedCalcScore).toHaveBeenCalledTimes(2);
      expect(mockedCalcScore).toHaveBeenCalledWith('high', false);
      expect(mockedCalcScore).toHaveBeenCalledWith('low', true);
    });

    it('verifies that getSummary still calls findOne first', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      mockedGenerateSummary.mockReturnValue('irrelevant');

      // getSummary calls findOne internally, which throws if not found
      await expect(service.getSummary('ghost')).rejects.toThrow(NotFoundException);

      // generateTaskSummary was never called — findOne threw first
      expect(mockedGenerateSummary).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------
  // COMPARISON SUMMARY — When to use each
  // ---------------------------------------------------------------

  describe('comparison: choosing the right mock tool', () => {
    it('jest.fn() for NestJS-injected dependencies', () => {
      // ✅ Services, repositories, guards — anything in the DI container
      // We already did this above with mockRepository and mockNotifications
      expect(jest.isMockFunction(mockRepository.save)).toBe(true);
      expect(jest.isMockFunction(mockNotifications.sendReminder)).toBe(true);
    });

    it('jest.mock() for directly imported modules', () => {
      // ✅ Utility functions, helpers, libraries imported with `import`
      // NOT in the NestJS DI container, so provider replacement won't work
      expect(jest.isMockFunction(taskUtils.generateTaskSummary)).toBe(true);
      expect(jest.isMockFunction(taskUtils.calculatePriorityScore)).toBe(true);
    });

    it('jest.spyOn() for observing real methods without full replacement', () => {
      // ✅ When you want to verify a call happened but keep real behaviour
      // ✅ When you need to temporarily override then restore
      const spy = jest.spyOn(service, 'findAll');

      // The spy wraps the real method — it's both a mock AND the original
      expect(jest.isMockFunction(spy)).toBe(true);

      spy.mockRestore();
    });
  });
});
