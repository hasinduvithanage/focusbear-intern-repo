What is the role of a controller in NestJS?
It receives incoming HTTP requests, then it identifies which function should handle the request based on the route and method, and then it returns the response. 


How should business logic be separated from the controller?
All the business logic should be put into a service. The controller will just call the service method and pass along required details. This way the business logic is seperated from the controller.


Why is it important to use services instead of handling logic inside controllers?
Since we can reuse the logic and it is cleaner. If the logic was in the controller, we would have to copy and paste the logic every time we need it, which leads to duplications of code. 


How does NestJS automatically map request methods (GET, POST, etc.) to handlers?
NestJS uses decorators to map request methods automatically. NestJS registers @Get(":id") as a method to handle GET requests at the route. NestJS builds a routing table with all the decorators at the start.
