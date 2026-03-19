What is the difference between an interceptor and middleware in NestJS?

Middleware only sees the raw incoming request whereas interceptor wraps around the controller so they can see and modify the request and the response,

When would you use an interceptor instead of middleware?

If the response needs to be transformed or manipulated, we need to use an interceptor.

How does LoggerErrorInterceptor help?

It catches errors thrown during request handling and logs them with structured details like the error message, status code, and request info. This gives us centralised, consistent error logging across my whole app without adding try/catch blocks in every controller.
