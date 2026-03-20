What are the benefits of using nestjs-pino for logging?

It outputs JSON logs with timestamps and severity levels, making them searchable by monitoring tools. It auto-logs every HTTP request and is very fast. You can set different log levels per environment.

How does global exception handling improve API consistency?

It catches every error in one place and returns the same format every time (statusCode, message, timestamp, path). Frontend developers always know what to expect.

What is the difference between a logging interceptor and an exception filter?

Interceptor logs successful requests (the happy path). Exception filter catches and formats errors (the unhappy path).

How can logs be structured to provide useful debugging information?

Attach context to every log like logger.info({ taskId }, 'Task created') so you can search by specific fields. Use appropriate levels (debug, warn, error) and include identifiers like taskId and userId to trace issues.
