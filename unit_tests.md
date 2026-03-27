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
