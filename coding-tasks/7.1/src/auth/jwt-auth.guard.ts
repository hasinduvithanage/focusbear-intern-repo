import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// ---------------------------------------------------------------
// JWT AUTH GUARD — Protects routes by requiring a valid Auth0 token
//
// This guard triggers the JwtStrategy. When you put @UseGuards(JwtAuthGuard)
// on a controller or method, NestJS will:
//
//   1. Extract the Bearer token from the Authorization header
//   2. Run JwtStrategy to validate it (signature, issuer, audience)
//   3. If valid → attach decoded payload to request.user, proceed
//   4. If invalid → return 401 Unauthorized
//
// This guard only checks "is the user logged in with a valid token?"
// It does NOT check permissions — that's the PermissionsGuard's job.
// ---------------------------------------------------------------

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw new UnauthorizedException(
        'Missing or invalid authorization token. ' +
        'Include a valid Auth0 Bearer token in the Authorization header.',
      );
    }
    return user;
  }
}
