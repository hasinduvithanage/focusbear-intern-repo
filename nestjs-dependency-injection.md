How does dependency injection improve maintainability?

It separates object creation from business logic, making code easier to modify, reuse, and test without changing multiple parts of the application.

What is the purpose of the @Injectable() decorator?

It marks a class as a provider/service so NestJS can manage it and inject it into other classes using the dependency injection system.

What are the different types of provider scopes, and when would you use each?

- Singleton (default): One shared instance for the whole app; used for most services.
- Request: New instance per HTTP request; used for request-specific data.
- Transient: New instance every time it is injected; used for independent or stateful helpers.

How does NestJS automatically resolve dependencies?

NestJS uses its dependency injection container to read constructor parameters, find the required providers registered in modules, create instances if needed, and inject them automatically.
