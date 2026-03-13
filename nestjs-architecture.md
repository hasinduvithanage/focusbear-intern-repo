What is the purpose of a module in NestJS?

  A module is used to group together controllers, providers, imported modules to create a feature. 

How does a controller differ from a provider?

  A controller handles HTTP requests, whereas a provider is the class which contains the logic.

Why is dependency injection useful in NestJS?

  Developers do not need to create objects manually, we just have to declare the services we need in the constructor and NestJS will handle it.

How does NestJS ensure modularity and separation of concerns?

  Each module in NestJS is self-contained, this means it is isolated. So we can modify modules without affecting another modules. The module has its own controllers and providers. The controller only handles requests and the service only handles logic, this is how NestJS acheives seperation of concerns.

