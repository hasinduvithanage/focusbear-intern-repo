How does Supertest help test API endpoints?

Supertest sends HTTP requests to the NestJS app and lets us check responses, to verify the endpoints.

What is the difference between unit tests and API tests?

Unit tests check small pieces of code that are in isolation, whereas API tests check how the application behaves throug real HTTP endpoints.

Why should authentication be mocked in integration tests?

Auth is mocked since the test needs to be focused on the endpoint behavior without depending on real login flows, and external auth services.

How can you structure API tests to cover both success and failure cases?

Write tests for valid requests that should succeed, then add tests for invalid input, missing fields, unauthorized access, and other errors to confirm the API handles both normal and edge cases properly.
