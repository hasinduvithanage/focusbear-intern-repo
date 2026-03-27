// ---------------------------------------------------------------
// JWT AUTH GUARD — Test-friendly version
//
// In your real 7.1 project, this extends AuthGuard('jwt') and
// validates tokens against Auth0's JWKS endpoint.
//
// For this exercise, it simulates the same behaviour:
//   - No Authorization header → 401 Unauthorized
//   - Invalid token format → 401 Unauthorized
//   - Valid "Bearer test-token" → sets request.user and allows access
//
// This lets Supertest tests verify auth enforcement without
// needing real Auth0 tokens.
// ---------------------------------------------------------------

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

// Simulated user database — maps tokens to user profiles
const TEST_USERS: Record<string, { userId: string; permissions: string[] }> = {
  'test-admin-token': {
    userId: 'auth0|admin-001',
    permissions: ['create:tasks', 'read:tasks', 'update:tasks', 'delete:tasks'],
  },
  'test-reader-token': {
    userId: 'auth0|reader-001',
    permissions: ['read:tasks'],
  },
  'test-writer-token': {
    userId: 'auth0|writer-001',
    permissions: ['create:tasks', 'read:tasks', 'update:tasks'],
  },
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    // No Authorization header → reject
    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    // Must be "Bearer <token>" format
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    // Look up the test user by token
    const user = TEST_USERS[token];
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Attach user to request (same as real passport-jwt does)
    request.user = user;
    return true;
  }
}