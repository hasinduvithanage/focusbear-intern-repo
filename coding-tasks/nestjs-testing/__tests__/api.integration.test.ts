// ---------------------------------------------------------------
// API INTEGRATION TESTS — Supertest
//
// These tests send REAL HTTP requests through the full NestJS
// pipeline: middleware → guards → pipes → controller → service.
//
// Unlike unit tests (which call methods directly), these test
// what a real client would experience when calling the API.
//
// THREE AREAS COVERED:
//   1. GET endpoint — status codes, response shapes, error handling
//   2. POST endpoint — request validation via DTOs and ValidationPipe
//   3. Authentication — testing with/without tokens, permission checks
//
// TEST TOKENS (defined in jwt-auth.guard.ts):
//   - 'test-admin-token'  → all permissions (create, read, update, delete)
//   - 'test-reader-token' → read:tasks only
//   - 'test-writer-token' → create, read, update (no delete)
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TASK_REPOSITORY } from '../src/tasks.service';
import { Task } from '../src/task.types';

describe('Tasks API (integration)', () => {
  let app: INestApplication;
  let mockRepository: Record<string, jest.Mock>;

  // ---------------------------------------------------------------
  // SAMPLE DATA
  // ---------------------------------------------------------------

  const sampleTask: Task = {
    id: 'uuid-1',
    title: 'Integration Test Task',
    description: 'Created via Supertest',
    completed: false,
    priority: 'medium',
  };

  const tasksList: Task[] = [
    sampleTask,
    {
      id: 'uuid-2',
      title: 'Second Task',
      description: 'Also for testing',
      completed: true,
      priority: 'high',
    },
  ];

  // ---------------------------------------------------------------
  // SETUP — Create the full NestJS application
  //
  // beforeAll (not beforeEach) — starting the app is expensive,
  // so we do it once for the entire test suite.
  //
  // We override the TASK_REPOSITORY provider with a mock so
  // no real database is needed. Everything else (guards, pipes,
  // controller, service) runs for real.
  //
  // The ValidationPipe is registered globally, just like in your
  // 7.1 project's main.ts. This enables DTO validation testing.
  // ---------------------------------------------------------------

  beforeAll(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // ---------------------------------------------------------------
      // Override the repository with our mock.
      // The service, controller, guards all remain REAL.
      // Only the database layer is faked.
      // ---------------------------------------------------------------
      .overrideProvider(TASK_REPOSITORY)
      .useValue(mockRepository)
      .compile();

    app = moduleFixture.createNestApplication();

    // ---------------------------------------------------------------
    // Register the same global ValidationPipe as your real app.
    // Without this, DTOs would not be validated and Supertest
    // would never see 400 errors for bad input.
    // ---------------------------------------------------------------
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Reset mock configurations between tests (but don't restart the app)
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =================================================================
  // PART 1: GET ENDPOINT TESTS
  //
  // Testing GET /tasks and GET /tasks/:id
  // Verifies: status codes, response body shape, empty results,
  // not found handling.
  // =================================================================

  describe('GET /tasks', () => {
    it('returns 200 and an array of tasks', async () => {
      mockRepository.find.mockResolvedValue(tasksList);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .expect(200);

      // ---------------------------------------------------------------
      // response.body is the parsed JSON response.
      // We verify it's an array with the right length and structure.
      // ---------------------------------------------------------------
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Integration Test Task');
      expect(response.body[1].completed).toBe(true);
    });

    it('returns 200 and empty array when no tasks exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns 200 and the task when found', async () => {
      mockRepository.findOneBy.mockResolvedValue(sampleTask);

      const response = await request(app.getHttpServer())
        .get('/tasks/uuid-1')
        .set('Authorization', 'Bearer test-admin-token')
        .expect(200);

      expect(response.body.id).toBe('uuid-1');
      expect(response.body.title).toBe('Integration Test Task');
      expect(response.body.completed).toBe(false);
    });

    it('returns 404 when task does not exist', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/tasks/nonexistent')
        .set('Authorization', 'Bearer test-admin-token')
        .expect(404);

      // ---------------------------------------------------------------
      // Verify the error response structure.
      // NestJS's default exception filter returns this format.
      // Your AllExceptionsFilter in 7.1 returns a similar shape.
      // ---------------------------------------------------------------
      expect(response.body.statusCode).toBe(404);
      expect(response.body.message).toContain('nonexistent');
    });
  });

  // =================================================================
  // PART 2: POST ENDPOINT WITH VALIDATION
  //
  // Testing POST /tasks with the ValidationPipe + CreateTaskDto.
  // Verifies: valid data accepted, invalid data rejected with 400,
  // specific validation error messages returned.
  // =================================================================

  describe('POST /tasks (validation)', () => {
    it('returns 201 and the created task for valid input', async () => {
      const newTask = { ...sampleTask };
      mockRepository.create.mockReturnValue(newTask);
      mockRepository.save.mockResolvedValue(newTask);

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({ title: 'Integration Test Task', description: 'Created via Supertest' })
        .expect(201);

      expect(response.body.title).toBe('Integration Test Task');
      expect(response.body.id).toBeDefined();
    });

    it('returns 400 when title is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({ description: 'No title provided' })
        .expect(400);

      // ---------------------------------------------------------------
      // ValidationPipe returns error details in response.body.message.
      // It's an array of validation error strings.
      // ---------------------------------------------------------------
      expect(response.body.message).toBeDefined();
    });

    it('returns 400 when title is empty string', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({ title: '', description: 'Empty title' })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('returns 400 when description is missing', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({ title: 'Valid Title' })
        .expect(400);
    });

    it('returns 400 when body is completely empty', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({})
        .expect(400);
    });

    it('returns 400 when unknown fields are included (forbidNonWhitelisted)', async () => {
      // ---------------------------------------------------------------
      // forbidNonWhitelisted: true means any property NOT in the DTO
      // causes a 400 error. This prevents clients from sending
      // unexpected data that could bypass validation or cause issues.
      // ---------------------------------------------------------------
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({
          title: 'Valid',
          description: 'Also valid',
          hackerField: 'should be rejected',
        })
        .expect(400);
    });

    it('returns 400 when title is not a string', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-admin-token')
        .send({ title: 12345, description: 'Title is a number' })
        .expect(400);
    });
  });

  // =================================================================
  // PART 3: AUTHENTICATION AND AUTHORIZATION
  //
  // Testing the guard pipeline with different tokens.
  //
  // Three test tokens are defined in jwt-auth.guard.ts:
  //   - test-admin-token  → all permissions
  //   - test-reader-token → read:tasks only
  //   - test-writer-token → create, read, update (no delete)
  //
  // This simulates what your real Auth0 setup does:
  //   - JwtAuthGuard checks token validity → 401 if invalid
  //   - PermissionsGuard checks RBAC permissions → 403 if insufficient
  // =================================================================

  describe('Authentication (401 — no/invalid token)', () => {
    it('returns 401 when no Authorization header is sent', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);

      expect(response.body.message).toContain('No authorization token');
    });

    it('returns 401 when Authorization header has wrong format', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
    });

    it('returns 401 when token is not recognised', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer fake-token-12345')
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });

    it('returns 401 for POST without token', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'Test', description: 'No auth' })
        .expect(401);
    });

    it('returns 401 for DELETE without token', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/uuid-1')
        .expect(401);
    });
  });

  describe('Authorization (403 — insufficient permissions)', () => {
    it('reader CAN access GET /tasks', async () => {
      mockRepository.find.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', 'Bearer test-reader-token')
        .expect(200);
    });

    it('reader CANNOT access POST /tasks (needs create:tasks)', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-reader-token')
        .send({ title: 'Test', description: 'Reader trying to create' })
        .expect(403);
    });

    it('reader CANNOT access DELETE /tasks/:id (needs delete:tasks)', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/uuid-1')
        .set('Authorization', 'Bearer test-reader-token')
        .expect(403);
    });

    it('writer CAN access POST /tasks (has create:tasks)', async () => {
      mockRepository.create.mockReturnValue(sampleTask);
      mockRepository.save.mockResolvedValue(sampleTask);

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-writer-token')
        .send({ title: 'Writer Task', description: 'Has permission' })
        .expect(201);
    });

    it('writer CANNOT access DELETE /tasks/:id (no delete:tasks)', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/uuid-1')
        .set('Authorization', 'Bearer test-writer-token')
        .expect(403);
    });

    it('admin CAN access DELETE /tasks/:id (has delete:tasks)', async () => {
      mockRepository.findOneBy.mockResolvedValue(sampleTask);
      mockRepository.remove.mockResolvedValue(sampleTask);

      const response = await request(app.getHttpServer())
        .delete('/tasks/uuid-1')
        .set('Authorization', 'Bearer test-admin-token')
        .expect(200);

      expect(response.body.message).toContain('Integration Test Task');
    });
  });

  describe('Auth + Validation combined', () => {
    // ---------------------------------------------------------------
    // This test verifies the GUARD ORDER matters.
    // Auth (401) is checked BEFORE validation (400).
    // If there's no token, the request is rejected with 401 even
    // if the body is also invalid.
    // ---------------------------------------------------------------

    it('returns 401 (not 400) when both auth and validation fail', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        // No Authorization header AND invalid body
        .send({ title: '' })
        .expect(401);
    });

    it('returns 403 (not 400) when auth passes but permissions fail, even with bad body', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', 'Bearer test-reader-token')
        // Reader doesn't have create:tasks, AND body is invalid
        .send({ title: '' })
        .expect(403);
    });
  });
});
