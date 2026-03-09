4.1 Understanding Clean Code Principles

Simplicity – Avoiding unnecessary complexity and extra logic so that code is easier to test and debug.

Readability – The code should be easy and clear to follow, with meaningful names so other developers can understand the code easier.

Maintainability – The code should be easy to update and build on top of later on. Future developers need to be able to work with the code.

Consistency – Follow the same naming, formatting patterns across the code. 

Efficiency – Code should use resources effectively.


4.2 Naming Variables & Functions

What makes a good variable or function name?
A good name for a variable and function clearly describes what the variable holds. It would be consistent across the code and will help developers understand the code without needing extra explanations. Eg: calulcateTotal()

What issues can arise from poorly named variables?
Developers can misunderstand the purpose of the variable which could lead to bugs.
It also makes debugging and maintaining the code more difficult.

How did refactoring improve code readability?
Refactoring allowed me to understand the purpose of the function and the variable at a glance. It made the code easier to follow and understand. And later it will be much easier for me to go back to the code to maintain it or add things on top of it.


4.3 Writing Small, Focused Functions

Why is breaking down functions beneficial?
The main purpose of breaking down functions is to make the code easier to read, and debug. By writing code where each function has one responsibility problems are easier to identify and changes are safer to make for the individual functions.

How did refactoring improve the structure of the code?
After refactoring the code stops looking like one large block of logic. There is better readability since the code was broken into clear steps. 


4.4 Avoiding Code Duplication

What were the issues with duplicated code?
It was unneccessarily long and it makes the code harder to read since the same logic appears in multiple places.

How did refactoring improve maintainability?
Refactoring removes the duplicate code so that if there is a change later on, the change would not have to be implemented in multiple areas, which would increase the risk of errors. 


4.5 Commenting & Documentation

Add comments when they explain why, assumptions, or tricky logic. Avoid comments that merely restate obvious code. First improve readability with clear names, small functions, and simple structure. Use comments only when code alone cannot clearly express the intent or important context.


4.6 Handling Errors & Edge Cases



4.7 Refactoring Code for Simplicity



4.8 Identifying & Fixing Code Smells



4.9 Writing Unit Tests for Clean Code



4.10 Code Formatting & Style Guides



4.11 Static Analysis Checks in CI/CD







