import * as Joi from 'joi';

// ---------------------------------------------------------------
// ENV VALIDATION SCHEMA
//
// This runs when the app starts. If any variable is missing or
// invalid, NestJS throws an error immediately with a clear
// message — instead of failing randomly later at runtime.
//
// Example error if AUTH0_DOMAIN is missing:
//   Error: Config validation error: "AUTH0_DOMAIN" is required
//
// This would have caught the AUTH0_AUDIENCE typo we debugged
// earlier if we'd required a specific format.
// ---------------------------------------------------------------

export const envValidationSchema = Joi.object({
  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5433),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().default('focusbear_dev'),

  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Encryption — 32-byte key expressed as 64 lowercase hex chars (AES-256-CBC)
  ENCRYPTION_KEY: Joi.string().hex().length(64).required().messages({
    'any.required': 'ENCRYPTION_KEY is required (64 hex chars, e.g. openssl rand -hex 32)',
    'string.hex': 'ENCRYPTION_KEY must be a lowercase hex string',
    'string.length': 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)',
  }),

  // Auth0 — both are required, no defaults (these must be set explicitly)
  AUTH0_DOMAIN: Joi.string().required().messages({
    'any.required': 'AUTH0_DOMAIN is required (e.g., dev-xxxxx.us.auth0.com)',
  }),
  AUTH0_AUDIENCE: Joi.string().uri().required().messages({
    'any.required': 'AUTH0_AUDIENCE is required (e.g., https://api.focusbearhasi.io)',
    'string.uri': 'AUTH0_AUDIENCE must be a valid URL',
  }),
});
