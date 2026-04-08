How does Bruno help with API testing compared to Postman or cURL?
Bruno is lightweight, open-source, and stores requests as files locally, making it version-control friendly. Compared to Postman, it’s simpler and less resource-heavy, and compared to cURL, it provides a user-friendly UI for managing requests.

How do you send an authenticated request in Bruno?
You add authentication through headers (e.g., Authorization: Bearer token) or use built-in auth options, then include the token when sending the request.

What are the advantages of organizing API requests in collections?
Collections keep requests structured, reusable, and easy to manage. They help with testing workflows, collaboration, and maintaining consistency across endpoints.

How would you structure a Bruno collection for a NestJS backend project?
I would group requests by modules (e.g., auth, users, products), include separate folders for CRUD operations, and store environment variables (like base URL and tokens) for easy reuse.
