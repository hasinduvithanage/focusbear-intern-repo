Why is it important to test services separately from controllers?

This is because controllers are just the routing layers between requests and services. Services contain the business logic, so if a service test fails then the logic behind the code is wrong whereas a controller test would only identify wrong routings.

How does mocking dependencies improve unit testing?

Mocking isolates the code that is being tested. So when I test a service I mocke other services so that I am only testing the target service. Mocking is also fast and deterministic.

What are common pitfalls when writing unit tests in NestJS?

- Not resetting tests between testing.
- Over-mocking where so much is mocked that nothing is really being tested.
- Writing controller tests that are too complicated - this means that there is code in controller that actually should be in service.

How can you ensure that unit tests cover all edge cases?

By testing in 3 different ways. The normal path which includes normal input and expected output, the error path where errors are tested and boundary cases.
