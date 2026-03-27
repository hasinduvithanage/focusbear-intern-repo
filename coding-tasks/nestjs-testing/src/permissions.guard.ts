import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read the @Permissions() decorator from the route handler
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Permissions() decorator = no restrictions
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user from request (set by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const userPermissions: string[] = request.user?.permissions ?? [];

    // Check that the user has ALL required permissions
    return requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );
  }
}
