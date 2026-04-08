How can logging request payloads help with debugging?
It helps you see exactly what data the API receives, making it easier to identify issues like missing fields, incorrect formats, or wrong headers.

What tools can you use to inspect API requests and responses?
Tools like Bruno, Postman, and cURL let you send requests, view responses, and test headers, authentication, and payloads.

How would you debug an issue where an API returns the wrong status code?
I would check controller logic, validate conditions and error handling, inspect request data, and use breakpoints or logs to trace where the wrong status is being set.

What are some security concerns when logging request data?
Sensitive data like passwords, tokens, or personal information can be exposed, so logs should avoid storing or mask confidential information.
