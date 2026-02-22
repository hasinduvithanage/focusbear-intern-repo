Research what causes merge conflicts in Git.

This happens when the same line of code is different in the main branch and the other branch that is to be merged to the main branch.

Create a merge conflict in your test repo by:
Creating a branch and editing a file.
Switching back to main, making a conflicting edit in the same file, and committing it.
Merging the branch back into main.

Use your Git desktop client to resolve the conflict.

Write about your experience:
What caused the conflict?

I edited the first line of a test.md file in main and made a different edit to the same file in a different branch called merge-conflict-test, and tried to merge the two branches.

How did you resolve it?

Using GitHub Desktop I clicked resolve conlficts in Visual Studio, I went to the IDE and cleared up the changes.

What did you learn?

I learned that these conflicts are more of a fail safe to prevent accidents rather than errors. 

Commit and push your changes to GitHub.

Done

3.1 Pull Requests

Why are PRs important in a team workflow?

It helps create a searchable record of why a specific change was made. This can be used to do code reviews so that there are multiple people going over a change before it is actually implemented, so it gives credibility to changes. So it also prevents broken code from entering the codebase.

What makes a well-structured PR?

A good PR should have context, like why a change was made and how it was made. Keep PRs to a small number of lines so that it is easier to review.

What did you learn from reviewing an open-source PR?

I learned the importance of rigorous communication. I learned that it is important to prioritize backward compatibility, and clear documentation. And when reviewing it is important to make sure that the changes align with the project's long term architecture and standards.




3.2 Writing Meaningful Commit Messages 
What makes a good commit message?

The subject line should be short and to the point. Use prefixes to categorize the changes. In the body include context and the changes made and in what lines.

How does a clear commit message help in team collaboration?

This leads to faster code reviews by bypassing confusion in the intent behind the change. Can debug efficiently since all changes will be stored clear cut in history. 

How can poor commit messages cause issues later?

Months from an edit, poor messages can provide no context which would confuse developers as they would not know if that specific code can be changed or not. Without proper context, future developers will have to spend a lot of time understanding the code.

3.3 Understandin Git Bisect

What does git bisect do?



When would you use it in a real-world debugging situation?

How does it compare to manually reviewing commits?





