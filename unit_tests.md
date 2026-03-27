9.1
What was the most challenging part of testing Redux?

I did not realize that I could call fetchTasks.pending(), fulfilled(), and .rejected() directly since they are action creators. So I had challenges understanding async thunks testing. 

How do Redux tests differ from React component tests?

Redux tests are pure function tests, where we pass in a state and action and check the return state. React component tests need tools like React Testing , whereas Redux tests just need Jest and a reducer function, so these are faster to write, and faster to run.


9.2
Why is it important to mock API calls in tests?

Real API’s are slow, unreliable, and need credentials. Unreliable since a real API call would fail because a server is down, or the network is bad and will have nothing to do with my code. It needs Auth0 tokens, database access and network connectivity just to run unit tests. 

Mocking replaces the real API call with a fake function I control. I can decide what it returns, when it resolves, and whether it fails. My tests become fast, deterministic, and completely isolated from external systems.

What are some common pitfalls when testing asynchronous code?

-When we call render({<TaskList/>}) and immediately check for task names, it will not work since the API data has not arrived yet. So we should add await waitfor() to keep checking the DOM until the data appears.
- If we do not reset tests between tests, some configurations would leak from previous test into the new test, and therefore will fail. using jest.resetAllMocks() we can reset each test inbetween tests.


9.3
What are the benefits of using React Testing Library instead of testing implementation details?

React Testing Library allows me to test what the user sees and does like clicking buttons. This test passes as long as the user experience stays the same, whereas implementation check tests break down every time I change how the code works.

What challenges did you encounter when simulating user interaction?

A big challenge was testing multi-step flows, where clicking one butting like Start focusing for example will change the button to Stop focusing, so the order of interactions should be correct. I had to think about the current name/state of the button at each step.


9.4 

Why is automated testing important in software development?

Automated testing is important because they catch bugs instantly every time we change the code. They run rapidly and prevent working feature breaks because of a change in the code. 

What did you find challenging when writing your first Jest test?

Understanding that different situations need a different matcher. Like toBe cannot be used for objects and needs toEqual instead. 
Example of code:
    expect(getTasksByPriority(allHigh, 'low')).toEqual([]);


9.5


What are the key differences between unit, integration, and E2E tests?

Unit tests check one single piece of code in isolation, like a function. It tests the smallest pieces of code possible. It is very fast and help pinpoint exactly where the bug is. Integration testing checks multiple pieces of code working together like a controller calling a real service, with the database mocked. They check bugs in pieces connected together. E2E (End to End) testing tests the full application and sends real HTTP requests, testing the entire pipeline from request to response. They are the slowest but most realistic as well.

Why is testing important for a NestJS backend?

The backend handles data that users depend on like task creation, authentication, notifications. A bug that is not obvious could disrupt data and expose endpoints to unauthorized users. Tests will catch these sort of issues before they reach production level. They also reduce anxiety when it comes to changing code since I can use tests to know immediately if the code has broken somethin else.

How does NestJS use @nestjs/testing to simplify testing?

@nestjs/testing provides Test.createTestingModule(), this creates a smaller NestJS app with full dependency injection support. Here I can swap real dependencies with mocks. The testing module handles all the wiring automatically. 

What are the challenges of writing tests for a NestJS application?

Challenges include deciding what to mock and what to keep real from the code. If you mock too many things then we will not be able to catch real integration issues, whereas if you mock too little the tests need a running database and Redis server to pass.












