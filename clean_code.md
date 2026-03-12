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
Code (commit ID): 4b9d6eecbb43675d36d0db41f75eaea1c6aa0aca

What was the issue with the original code?
The original code did not properly check for invalid inputs or edge cases. This could cause unexpected behaviour or runtime errors if the function received incorrect data, empty values, or values outside the expected range.

How does handling errors improve reliability?
Handling errors improves reliability by ensuring the program can safely manage unexpected inputs or situations. Using techniques like guard clauses prevents invalid data from being processed and allows the program to fail safely instead of crashing.

4.7 Refactoring Code for Simplicity

What made the original code complex?
The original code was complex because it was doing too many things at once, which made it harder to read, test, and debug. It also had repeated logic and unclear structure, so understanding the purpose of each part took more effort.

How did refactoring improve it?
Refactoring improved it by making the code cleaner, more organized, and easier to follow. Breaking it into smaller parts and removing repetition made it easier to maintain, test, and update without affecting other parts of the program.

4.8 Identifying & Fixing Code Smells

What code smells did you find in your code?
I wrote several code smells, including magic numbers and strings, long functions, duplicate code, large classes, deeply nested conditionals, commented-out code, and inconsistent naming.

How did refactoring improve the readability and maintainability of the code?
Refactoring made the code easier to understand by improving structure, using clearer names, reducing repetition, and separating responsibilities. This makes the code easier to read, update, and maintain later.

How can avoiding code smells make future debugging easier?
Avoiding code smells makes debugging easier because the code is clearer and more predictable. When each part has a clear purpose, it is easier to find where a problem starts and fix it without affecting unrelated parts.

4.9 Writing Unit Tests for Clean Code

How do unit tests help keep code clean?
Unit tests help keep code clean because they encourage me to write smaller, focused, and predictable functions. Code that is easier to test is usually easier to read, maintain, and improve.

What issues did you find while testing?
While testing, I found issues such as functions not handling invalid inputs properly, unexpected outputs for edge cases, and parts of the code being harder to test because they were too large or doing too many things at once.

4.10 Code Formatting & Style Guides

Why is code formatting important?
Code formatting is important because it makes code more consistent, readable, and professional. It helps me and other developers understand the code faster and reduces confusion when working on the same project.

What issues did the linter detect?
The linter detected issues such as inconsistent spacing, missing semicolons, unused variables, and code that did not follow the expected style rules. These were small issues, but they affect code quality and consistency.

Did formatting the code make it easier to read?
Yes, formatting the code made it easier to read. Once the spacing, indentation, and structure were consistent, the code looked much cleaner and it was easier to follow what each part was doing.
