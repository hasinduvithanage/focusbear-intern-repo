import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // In real project: extends AuthGuard('jwt') which validates
    // the Auth0 token and sets request.user
    // For this exercise: always returns true
    return true;
  }
}
