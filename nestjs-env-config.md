How does @nestjs/config help manage environment variables?

It loads .env file automatically and provides the ConfigService service which can be used to inject anywhere to read values from .env. so this keeps secrets out of the code.

Why should secrets (e.g., API keys, database passwords) never be stored in source code?

Because source code gets pushed to Git, shared with team members, and stored on services like GitHub. If a database password or API key is in your code, anyone with repo access can see it. You keep secrets in .env (which is in .gitignore) so they never leave your machine.


How can you validate environment variables before the app starts?

Can use validationSchema in ConfigModule.forRoot() with Joi library. 

How can you separate configuration for different environments (e.g., local vs. production)?

Use different .env files for each environment — .env.development, .env.staging, .env.production.
