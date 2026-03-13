What files are included in a default NestJS project?

main.ts, app.module.ts, app.controller.ts, app.controller.spec.ts, and app.service.ts. They are inside the src folder.

How does main.ts bootstrap a NestJS application?

NestFactory.create(AppModule) creates the app and app.listen(3000) accepts requests on port 3000. NestFactory is a built in NestJS class that knows how to build apps and AppModule has all the controllers, services adn imports that NestJS needs to build the app.

What is the role of AppModule in the project?

It's the root module that ties everything together. It has registered all of the controllers, services, and imports other modules as the app grows.

How does NestJS structure help with scalability?

Since each feature gets its own module, developers can add features independently without touching other parts of the code. Everything stays organized so it is easier to grow the project.
