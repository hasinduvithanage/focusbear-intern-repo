import { SetMetadata } from '@nestjs/common';

// ---------------------------------------------------------------
// PERMISSIONS DECORATOR
//
// A clean way to declare which permissions an endpoint needs.
//
// Usage:
//   @Permissions('delete:tasks')
//   remove() { ... }
//
//   @Permissions('read:tasks', 'read:users')   // requires ALL listed
//   getDashboard() { ... }
//
// HOW IT WORKS:
//   SetMetadata() attaches data to the route handler's metadata.
//   The PermissionsGuard reads this metadata using Reflector to
//   know which permissions to check against the user's token.
//
//   This is the same pattern NestJS uses internally for things
//   like @Roles() — it's just metadata + a guard that reads it.
// ---------------------------------------------------------------

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
