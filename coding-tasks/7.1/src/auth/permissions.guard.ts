import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

// ---------------------------------------------------------------
// PERMISSIONS GUARD — Checks if the user has the required permissions
//
// This is the SECOND layer of protection (after JwtAuthGuard).
// It reads the permissions required by the endpoint (set via the
// @Permissions() decorator) and compares them against the user's
// permissions from the Auth0 token.
//
// FLOW:
//   1. Reflector reads the @Permissions('delete:tasks') metadata
//   2. Guard gets request.user.permissions (set by JwtStrategy)
//   3. Checks if the user has ALL required permissions
//   4. If yes → request proceeds
//   5. If no → throws 403 Forbidden
//
// WHY 403 (Forbidden) instead of 401 (Unauthorized)?
//   401 means "I don't know who you are" (no token or bad token).
//   403 means "I know who you are, but you're not allowed to do this."
//   The JwtAuthGuard handles 401. This guard handles 403.
// ---------------------------------------------------------------

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Step 1: Read the required permissions from the @Permissions() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [
        context.getHandler(),  // Check the method-level decorator first
        context.getClass(),    // Then check the class-level decorator
      ],
    );

    // If no @Permissions() decorator is present, allow access
    // (the route only requires authentication, not specific permissions)
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Step 2: Get the user's permissions from the validated token
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new ForbiddenException(
        'No permissions found in access token. ' +
        'Ensure RBAC is enabled in Auth0 and permissions are added to the token.',
      );
    }

    // Step 3: Check if the user has ALL required permissions
    const hasAllPermissions = requiredPermissions.every(
      (permission) => user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]. ` +
        `You have: [${user.permissions.join(', ')}].`,
      );
    }

    return true;
  }
}
