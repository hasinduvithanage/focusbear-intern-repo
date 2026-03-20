import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

// ---------------------------------------------------------------
// JWT STRATEGY — Validates Auth0 access tokens
//
// This is the FIRST layer of protection. It runs on every request
// that uses the JwtAuthGuard and checks three things:
//
//   1. Is the token's signature valid? (jwks-rsa verifies this
//      by fetching Auth0's public keys)
//   2. Was the token issued by OUR Auth0 tenant? (issuer check)
//   3. Was the token meant for OUR API? (audience check)
//
// If all three pass, the validate() method runs and attaches the
// decoded token payload to request.user — which the permissions
// guard reads later.
//
// HOW jwks-rsa WORKS:
//   Auth0 signs tokens with a private key. The matching public
//   key is published at https://YOUR_DOMAIN/.well-known/jwks.json.
//   jwks-rsa fetches and caches that public key so passport-jwt
//   can verify the signature without knowing Auth0's private key.
// ---------------------------------------------------------------

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const domain = configService.get<string>('AUTH0_DOMAIN');
    const audience = configService.get<string>('AUTH0_AUDIENCE');

    console.log('AUTH0_DOMAIN:', domain);
    console.log('AUTH0_AUDIENCE:', audience);

    super({
      // Where to find the JWT in the request: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Fetch Auth0's public signing key to verify token signatures
      secretOrKeyProvider: passportJwtSecret({
        cache: true,              // Cache the key so we don't fetch it every request
        rateLimit: true,          // Prevent too many requests to Auth0
        jwksRequestsPerMinute: 5, // Max 5 key fetches per minute
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),

      // The token must have been issued for THIS API
      audience: audience,

      // The token must come from OUR Auth0 tenant
      issuer: `https://${domain}/`,

      // Use RS256 algorithm (Auth0's default)
      algorithms: ['RS256'],
    });
  }

  // ---------------------------------------------------------------
  // validate() runs AFTER the token passes signature/issuer/audience
  // checks. The return value gets attached to request.user.
  //
  // The payload contains:
  //   sub: "auth0|abc123"          — the user's Auth0 ID
  //   permissions: ["read:tasks"]  — RBAC permissions from Auth0
  //   scope: "openid profile"      — OAuth scopes
  //
  // We return the full payload so the permissions guard can read
  // request.user.permissions later.
  // ---------------------------------------------------------------
  validate(payload: any) {
    return {
      userId: payload.sub,
      permissions: payload.permissions || [],
      scope: payload.scope,
    };
  }
}
