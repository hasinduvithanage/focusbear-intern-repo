9.7
Why is mocking important in unit tests?

Mocking helps to isolate the code under test, so you are able to test only one thing. Without mocks testing a service will require a database connection, a redis server and Auth0 credentials. Mock gives me more control since I can decide what the service returns.

How do you mock a NestJS provider (e.g., a service in a controller test)?

In Test.createTestingModule(), you add { provide: TasksService, useValue: mockService } to the providers array, where mockService is an object with jest.fn() for each method.
NestJS dependency injection gives the controller this mock instead of the real service.

What are the benefits of mocking the database instead of using a real one?

It is faster since a real db connection would take longer. It is more reliable since we are only testing one thing and everything else is mocked. There is more control since I can simulte db errors, and edge cases that will be hard to create with a real db.

How do you decide what to mock vs. what to test directly?

We can mock anything outside the code that we are currently testing. For example, for a service we can mock other services and repository. For a controller we can mock the service since the controller will only route.
