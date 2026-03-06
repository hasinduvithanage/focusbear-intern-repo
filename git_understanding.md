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
Git bisect is a debugging tool that helps find the exact commit that introduced the bug. After I identify a good commit and a bad commit, this tool will check all the middle commits for the first mad commit where the bug was created.

When would you use it in a real-world debugging situation?

- I would use it when there is a bug but I know that the bug was there for a while now and it is not a bug that I just found.
- I would also use it if the repo has many commits and manually checking would take time.

How does it compare to manually reviewing commits?

- It is much faster and there's less workload on the human coder to manually review all of the commits. If the changes themselves are large it will take a longer time and will be exhausting to check manually.



3.4 Advanced Git Commands & When to Use Them
What does each command do?

git checkout main -- <file>
- It helps to a file back to its orignial state from the main branch

git cherry-pick <commit> 
- This command commits a specific section from another branch into the current branch

git log
- This displays the commit history of a repo, like the author and the commit message.


git blame <file>
- It displays the commit including author and date that last modified a line of code.

When would you use it in a real project (hint: these are all really important in long running projects with multiple developers)?

git checkout main -- <file>
- This helps to restore a file to the original version in the main incase I accidentaly modify or break the file while working on a feature branch

git cherry-pick <commit> 
- If a specific bug fix was done in another branch I can just import that specific fix into my current branch that I am working on. 

git log
- This can be used to review past commits and understand what changes have been made and when.

git blame <file>
- This can be used when debugging and investigating issues in a codebase. It can be used to identify who made a change to a line of code that is causing issues.

What surprised you while testing these commands?

I was surprised by how precise the commands were when giving out the information. I also realized how useful these commands were and the level of flexibility offered by these commands were really good.




3.5 Branching & Team Collaboration

Why is pushing directly to main problematic?
Pushing directly to the main branch is problematic since a wrong/broken code can affect the entire project. It will disrupt other developers' works as well.

How do branches help with reviewing code?
Branches allow developers to work on features and bug fixes independently. The changes can then be reviewed before being merged. 

What happens if two people edit the same file on different branches?
There will be a merge conflict when merging the branches back into main. The developers must then manually review the differences and decide which iteration of the specific line of code to keep.


3.6 Git Concepts: Staging vs. Committing

What is the difference between staging and committing?
Staging means when I prepare the changes to be commited. Commiting means permanently saving the changes to the branch in the repository. 

Why does Git separate these two steps?
Git seperates the two since then developers have more control over what they are committing. For example, if they only want commit a few of the changes made, they can do that using staging and committing.

When would you want to stage changes without committing?
When I want to review what will be comitted without actually committing.




























