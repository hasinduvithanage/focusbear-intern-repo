9.1
What was the most challenging part of testing Redux?

I did not realize that I could call fetchTasks.pending(), fulfilled(), and .rejected() directly since they are action creators. So I had challenges understanding async thunks testing. 

How do Redux tests differ from React component tests?

Redux tests are pure function tests, where we pass in a state and action and check the return state. React component tests need tools like React Testing , whereas Redux tests just need Jest and a reducer function, so these are faster to write, and faster to run.


9.2
Why is it important to mock API calls in tests?
What are some common pitfalls when testing asynchronous code?
