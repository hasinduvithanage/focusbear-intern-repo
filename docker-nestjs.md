How does a Dockerfile define a containerized NestJS application?

It specifies the base image (Node.js), copies your source code in, installs dependencies, builds the TypeScript, and sets the startup command; giving Docker everything it needs to reproduce your app in any environment.

What is the purpose of a multi-stage build in Docker?

The first stage compiles TypeScript using all dev tools. The second stage copies only the compiled dist/ and production node_modules into a clean image — keeping the final image small and free of unnecessary build tools.

How does Docker Compose simplify running multiple services together?

Instead of manually starting each container with long docker run commands, one docker compose up starts all services, sets up a shared network between them, manages startup order via depends_on, and handles environment variables together.

How can you expose API logs and debug a running container?

Using below commands:
docker compose logs -f nestjs
docker exec -it nestjs_app sh
docker ps # to see what is running
