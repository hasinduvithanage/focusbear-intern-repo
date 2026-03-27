// ---------------------------------------------------------------
// COVERAGE GAPS + ASSERTION QUALITY — TEST SUITE
//
// This file exists to fill coverage gaps identified by running
// jest --coverage. It addresses three problems:
//
//   1. UNTESTED FILES — task.utils.ts has 0% coverage because
//      mocking-techniques.test.ts jest.mock()'s it, replacing
//      the real code with fakes. We need tests that run the REAL
//      functions.
//
//   2. WEAK TESTS — some tests execute code but don't verify
//      behaviour. We'll show before/after examples of refactoring
//      assertion-free tests into meaningful ones.
//
//   3. UNTESTED BRANCHES — the jwt-auth.guard.ts has multiple
//      conditional paths (no header, wrong format, unknown token,
//      valid token). Each branch needs a test.
//
// HOW TO FIND GAPS:
//   1. Run: npx jest --coverage --verbose
//   2. Check the terminal table for files with low % Branch
//   3. Open coverage/lcov-report/index.html in your browser
//   4. Click into files — red lines = untested code
//   5. Write tests that exercise those red lines
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/jwt-auth.guard';
import { Permissions, PERMISSIONS_KEY } from '../src/permissions.decorator';

// ---------------------------------------------------------------
// IMPORTANT: Do NOT jest.mock('./task.utils') here.
// We want the REAL functions to run so coverage counts them.
// The mocking-techniques.test.ts already tests the mocking
// approach — this file tests the actual logic.
// ---------------------------------------------------------------
import {
  generateTaskSummary,
  calculatePriorityScore,
} from '../src/task.utils';

// =================================================================
// PART 1: FILLING COVERAGE GAPS — task.utils.ts
//
// These functions were always mocked in other tests, so the real
// code never ran. Coverage showed 0% for this file.
// Now we test the actual implementations.
// =================================================================

describe('task.utils — real function tests (coverage gap)', () => {
  // ---------------------------------------------------------------
  // generateTaskSummary
  // ---------------------------------------------------------------

  describe('generateTaskSummary', () => {
    it('returns PENDING status for incomplete tasks', () => {
      const result = generateTaskSummary('My Task', false);
      expect(result).toBe('[PENDING] My Task');
    });

    it('returns DONE status for completed tasks', () => {
      const result = generateTaskSummary('Finished Task', true);
      expect(result).toBe('[DONE] Finished Task');
    });

    it('handles empty title', () => {
      const result = generateTaskSummary('', false);
      expect(result).toBe('[PENDING] ');
    });

    it('handles special characters in title', () => {
      const result = generateTaskSummary('Task & "Stuff" <done>', true);
      expect(result).toBe('[DONE] Task & "Stuff" <done>');
    });
  });

  // ---------------------------------------------------------------
  // calculatePriorityScore
  // ---------------------------------------------------------------

  describe('calculatePriorityScore', () => {
    it('returns 10 for high priority incomplete task', () => {
      expect(calculatePriorityScore('high', false)).toBe(10);
    });

    it('returns 5 for medium priority incomplete task', () => {
      expect(calculatePriorityScore('medium', false)).toBe(5);
    });

    it('returns 1 for low priority incomplete task', () => {
      expect(calculatePriorityScore('low', false)).toBe(1);
    });

    it('returns 0 for any completed task regardless of priority', () => {
      // ---------------------------------------------------------------
      // This tests the BRANCH: completed ? 0 : score
      // All three priorities should return 0 when completed.
      // Without these tests, only one branch of the ternary is covered.
      // ---------------------------------------------------------------
      expect(calculatePriorityScore('high', true)).toBe(0);
      expect(calculatePriorityScore('medium', true)).toBe(0);
      expect(calculatePriorityScore('low', true)).toBe(0);
    });
  });
});

// =================================================================
// PART 2: FILLING COVERAGE GAPS — jwt-auth.guard.ts
//
// The integration tests (api.integration.test.ts) test this guard
// via HTTP. But for UNIT test coverage, we need to call canActivate()
// directly to ensure every branch is covered.
// =================================================================

describe('JwtAuthGuard — branch coverage', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  // Helper to build a mock ExecutionContext with a given auth header
  const createMockContext = (authHeader?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: authHeader !== undefined
            ? { authorization: authHeader }
            : {},
          user: undefined, // will be set by guard if valid
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  // Branch 1: no Authorization header
  it('throws UnauthorizedException when no auth header', () => {
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('No authorization token');
  });

  // Branch 2: wrong format (no "Bearer" prefix)
  it('throws UnauthorizedException for non-Bearer format', () => {
    const context = createMockContext('Basic some-credentials');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Invalid authorization format');
  });

  // Branch 3: Bearer but no token after it
  it('throws UnauthorizedException when token is missing after Bearer', () => {
    const context = createMockContext('Bearer ');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  // Branch 4: unrecognised token
  it('throws UnauthorizedException for unknown token', () => {
    const context = createMockContext('Bearer completely-fake-token');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Invalid token');
  });

  // Branch 5: valid admin token
  it('returns true and sets request.user for valid admin token', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-admin-token' },
      user: undefined as any,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    // Verify user was attached to the request
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.userId).toBe('auth0|admin-001');
    expect(mockRequest.user.permissions).toContain('delete:tasks');
  });

  // Branch 6: valid reader token (different permission set)
  it('returns true and sets correct permissions for reader token', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-reader-token' },
      user: undefined as any,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    guard.canActivate(context);

    expect(mockRequest.user.userId).toBe('auth0|reader-001');
    expect(mockRequest.user.permissions).toEqual(['read:tasks']);
    expect(mockRequest.user.permissions).not.toContain('create:tasks');
  });

  // Branch 7: valid writer token
  it('returns true and sets correct permissions for writer token', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer test-writer-token' },
      user: undefined as any,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;

    guard.canActivate(context);

    expect(mockRequest.user.permissions).toContain('create:tasks');
    expect(mockRequest.user.permissions).toContain('update:tasks');
    expect(mockRequest.user.permissions).not.toContain('delete:tasks');
  });
});

// =================================================================
// PART 3: FILLING COVERAGE GAPS — permissions.decorator.ts
//
// The decorator is a one-liner, but it's included in coverage.
// We test that it sets metadata correctly.
// =================================================================

describe('Permissions decorator — coverage gap', () => {
  it('exports the correct PERMISSIONS_KEY', () => {
    expect(PERMISSIONS_KEY).toBe('permissions');
  });

  it('Permissions function is defined', () => {
    expect(typeof Permissions).toBe('function');
  });
});

// =================================================================
// PART 4: REFACTORING WEAK TESTS INTO STRONG ONES
//
// This section shows BEFORE and AFTER examples.
// Each "weak" test executes code but doesn't verify behaviour.
// Each "strong" replacement adds meaningful assertions.
// =================================================================

describe('Refactoring weak tests — before and after', () => {
  // ---------------------------------------------------------------
  // EXAMPLE 1: Assertion-free test
  //
  // WEAK (what it looked like before):
  //   it('runs generateTaskSummary', () => {
  //     generateTaskSummary('Task', false);
  //     // No expect() at all! This test always passes.
  //   });
  //
  // The coverage report shows this function as covered, but
  // the test doesn't verify the output. If someone changes the
  // function to return garbage, this test still passes.
  //
  // STRONG (refactored):
  // ---------------------------------------------------------------

  it('STRONG: verifies generateTaskSummary returns correct format', () => {
    const result = generateTaskSummary('Study Redux', false);

    // Multiple meaningful assertions
    expect(result).toBe('[PENDING] Study Redux');
    expect(result).toContain('PENDING');
    expect(result).toContain('Study Redux');
    expect(result).not.toContain('DONE');
  });

  // ---------------------------------------------------------------
  // EXAMPLE 2: Snapshot-only test for logic
  //
  // WEAK (what it looked like before):
  //   it('calculates priority score', () => {
  //     const result = calculatePriorityScore('high', false);
  //     expect(result).toMatchSnapshot(); // locks in whatever it returns
  //   });
  //
  // If the function returns the wrong value the first time,
  // the snapshot locks in the bug. Future runs compare against
  // the wrong baseline.
  //
  // STRONG (refactored):
  // ---------------------------------------------------------------

  it('STRONG: verifies exact priority score values', () => {
    // Explicit expected values, not snapshots
    expect(calculatePriorityScore('high', false)).toBe(10);
    expect(calculatePriorityScore('high', true)).toBe(0);

    // Verify the relationship between priorities
    const highScore = calculatePriorityScore('high', false);
    const mediumScore = calculatePriorityScore('medium', false);
    const lowScore = calculatePriorityScore('low', false);

    expect(highScore).toBeGreaterThan(mediumScore);
    expect(mediumScore).toBeGreaterThan(lowScore);
  });

  // ---------------------------------------------------------------
  // EXAMPLE 3: Testing only the happy path
  //
  // WEAK (what it looked like before):
  //   it('generates summary', () => {
  //     expect(generateTaskSummary('Task', false)).toBe('[PENDING] Task');
  //   });
  //   // Only tests one branch! The completed=true path is uncovered.
  //
  // STRONG (refactored — covers both branches):
  // ---------------------------------------------------------------

  it('STRONG: tests both branches of generateTaskSummary', () => {
    // Branch 1: not completed → PENDING
    expect(generateTaskSummary('Task A', false)).toBe('[PENDING] Task A');

    // Branch 2: completed → DONE
    expect(generateTaskSummary('Task B', true)).toBe('[DONE] Task B');

    // Now BOTH branches of the ternary are covered
  });

  // ---------------------------------------------------------------
  // EXAMPLE 4: Missing negative assertions
  //
  // WEAK (what it looked like before):
  //   it('completed task has zero score', () => {
  //     const score = calculatePriorityScore('high', true);
  //     expect(score).toBe(0);
  //     // Only checks the return value. Doesn't verify that
  //     // incomplete tasks DON'T return 0.
  //   });
  //
  // STRONG (refactored — also verifies the opposite case):
  // ---------------------------------------------------------------

  it('STRONG: verifies completed returns 0 AND incomplete returns non-zero', () => {
    // Positive assertion: completed → 0
    expect(calculatePriorityScore('high', true)).toBe(0);

    // Negative assertion: NOT completed → NOT 0
    expect(calculatePriorityScore('high', false)).not.toBe(0);
    expect(calculatePriorityScore('high', false)).toBeGreaterThan(0);
  });
});
