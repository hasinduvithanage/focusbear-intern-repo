What are the most common security vulnerabilities in a NestJS backend?

- SQL injection - harmful input that are executed as database queries 
- CORS misconfiguration - allowing any origin to to make authenticated requests
- mass assignment
- missing rate limiting - APIs vulnerable to DoS flooding

How does @fastify/helmet improve application security?

It sets security-related HTTP response headers automatically. The important ones: Content-Security-Policy restricts what resources browsers can load (blocks injected scripts), X-Content-Type-Options: nosniff prevents browsers from guessing content types, X-Frame-Options blocks clickjacking via iframes, and Strict-Transport-Security forces HTTPS connections. Without these headers, browsers make less secure default assumptions about your responses.

After registering `@fastify/helmet` in `main.ts`, I inspected the response headers using browser DevTools and confirmed that security headers like `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Content-Security-Policy` were automatically added to every response.


Why is rate limiting important for preventing abuse?

Without this a single client can send unlimited request which floods the database connections.

After registering `@fastify/rate-limit` with a max of 100 requests per minute, I verified that responses include `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers, and that exceeding the limit returns an HTTP 429 (Too Many Requests) status code.

How can sensitive configuration values be protected in a production environment?

Don't commit .env files to git — keep them in .gitignore. 
Validate all environment variables at startup (like your Joi schema does) so missing secrets fail fast.
Never expose secrets in error responses.
