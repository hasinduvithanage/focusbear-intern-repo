// ---------------------------------------------------------------
// PERMISSIONS GUARD — UNIT TEST SUITE
//
// The guard makes ONE decision: does this user have the required
// permissions to access this endpoint?
//
// To test it, we need to control two things:
//   1. What permissions the @Permissions() decorator requires
//      → we mock the Reflector to return whatever we want
//   2. What permissions the user has on their token
//      → we build a mock ExecutionContext with a fake request.user
//
// With these two mocks, we can test every authorization scenario
// without Auth0, without HTTP, without a running server.
// ---------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '../src/permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let mockReflector: { getAllAndOverride: jest.Mock };

  beforeEach(async () => {
    // ---------------------------------------------------------------
    // Mock the Reflector
    //
    // In production, the Reflector reads metadata set by decorators.
    // @Permissions('read:tasks') sets metadata on the route handler.
    // The guard calls reflector.getAllAndOverride() to read it.
    //
    // By mocking getAllAndOverride, we control what permissions
    // the guard thinks are required — without needing real decorators.
    // ---------------------------------------------------------------
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
  });

  // ---------------------------------------------------------------
  // HELPER: Build a mock ExecutionContext
  //
  // ExecutionContext is a NestJS wrapper around the HTTP request.
  // The guard calls:
  //   context.switchToHttp().getRequest() → gets the request object
  //   context.getHandler() → gets the route handler (for Reflector)
  //   context.getClass() → gets the controller class (for Reflector)
  //
  // We fake all three so the guard can run without a real HTTP request.
  // ---------------------------------------------------------------
  const createMockContext = (userPermissions: string[]): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: { permissions: userPermissions },
        }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  // =================================================================
  // ACCESS ALLOWED SCENARIOS
  // =================================================================

  describe('allows access', () => {
    it('when user has the single required permission', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks']);
      const context = createMockContext(['read:tasks']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('when user has all required permissions', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks', 'create:tasks']);
      const context = createMockContext(['read:tasks', 'create:tasks', 'update:tasks']);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('when no permissions are required (no @Permissions decorator)', () => {
      // When there's no @Permissions() decorator, reflector returns undefined
      mockReflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext([]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('when required permissions list is empty', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      const context = createMockContext([]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('when user has extra permissions beyond what is required', () => {
      // User has admin-level permissions, only read is required
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks']);
      const context = createMockContext([
        'read:tasks',
        'create:tasks',
        'update:tasks',
        'delete:tasks',
      ]);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  // =================================================================
  // ACCESS DENIED SCENARIOS
  // =================================================================

  describe('denies access', () => {
    it('when user lacks the required permission', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['delete:tasks']);
      const context = createMockContext(['read:tasks']);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('when user has some but not all required permissions', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks', 'delete:tasks']);
      const context = createMockContext(['read:tasks']); // missing delete:tasks

      expect(guard.canActivate(context)).toBe(false);
    });

    it('when user has no permissions at all', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks']);
      const context = createMockContext([]);

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  // =================================================================
  // EDGE CASES
  // =================================================================

  describe('edge cases', () => {
    it('handles missing user object gracefully', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks']);

      // User object is undefined — simulates a request with no token
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: undefined }),
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(false);
    });

    it('handles user with no permissions property gracefully', () => {
      mockReflector.getAllAndOverride.mockReturnValue(['read:tasks']);

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { userId: '123' } }), // no permissions field
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
