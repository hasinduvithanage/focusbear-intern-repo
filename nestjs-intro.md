What are the key differences between NestJS and Express.js?

Express only provides routing and the middleware, NestJS provides the entire structure, modules, controllers, services, dependancy injections. 

Why does NestJS use decorators extensively?

Decorators are labels that I can put to classes like @controller(), @ Injectable(), @Get(). So the framework, NestJS, reads them at startup and wires everything together by itself as opposed to us doing it manually.

How does NestJS handle dependency injection?

First we write and mark a service as @Injectable(), add it in a modeule's list of providers, then ask for it in a constructor. NestJS will see this and find it in the registry, build it and inject it.

What benefits does modular architecture provide in a large-scale app?

- Each feature is isolated in its own module
- Different developers can work on different modules without bothering each other
- Modules can be imported so it can be reused
- Can test modules seperately

