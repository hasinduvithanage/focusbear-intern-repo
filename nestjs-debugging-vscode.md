How do breakpoints help in debugging compared to console logs?
Breakpoints pause execution at specific lines, letting you inspect variables and step through code in real time, while console logs only show output without control over execution flow.

What is the purpose of launch.json, and how does it configure debugging?
launch.json defines how the debugger runs the app, including the entry file, environment variables, and runtime settings, so VS Code knows how to start and attach the debugger.

How can you inspect request parameters and responses while debugging?
You place breakpoints in controllers or services, then use the debugger panel to view variables like request body, params, and response data while stepping through execution.

How can you debug background jobs that don’t run in a typical request-response cycle?
You attach the debugger to the running process or start the job with a debug configuration, then place breakpoints inside the job logic to inspect execution when it runs.
