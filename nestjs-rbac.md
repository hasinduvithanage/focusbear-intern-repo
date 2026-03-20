How does Auth0 store and manage user roles?

Auth0 stores roles in its cloud database. We create roles in the dashboard, assign permission to each role , then assign the role to users. When a user logs in Auth0 looks up their roles, gather all the associated permissions and embeds them in the JWT token. The backend then reads the token.

What is the purpose of a guard in NestJS?

Guards are used for authentication, it is s function that runs before the controller method and decides whether the request should proceed or be blocked. 

How would you restrict access to an API endpoint based on user roles?

Can apply two guards to the endpoint. JWTAuthGuard and PermissionsGuard. One validates the Auth0 token and extracts the user's permissions. Second, PermissionGuard reads perissions and check if user has permission.

What are the security risks of improper authorization, and how can they be mitigated?

The main risks are: a regular user accessing admin features, users seeing other users' data, and stolen tokens being reused.
You mitigate these by: validating tokens on every request, putting permission checks on every endpoint, setting short token expiration times, using HTTPS so tokens can't be intercepted, and giving each role only the minimum permissions it needs.
