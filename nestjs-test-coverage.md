What does the coverage bar track, and why is it important?

It tracks how much of the code is exercised by tests, such as lines, branches, functions, and statements. It is important because it helps show which parts of the codebase may still be untested.

Why does Focus Bear enforce a minimum test coverage threshold?

This helps to maintain code quality and reduce the chance of bugs reaching production level. It makes sure that new code is properly tested before development.

How can high test coverage still lead to untested functionality?

A test can still interact with code without making a meaningful test on whether it work correctly or not, coverage only shows that code was executed.

What are examples of weak vs. strong test assertions?

A weak assertion might only check that a function returns something or that a request does not crash. A strong assertion checks the exact result, status code, error message, or side effect that should happen.

How can you balance increasing coverage with writing effective tests?

Instead of purely trying to increase coverage for the sake of it, we can focus on the important logic, edge cases, and real expected bahaviour.
