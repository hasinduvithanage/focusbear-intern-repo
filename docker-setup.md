What is the difference between docker run and docker compose up?

  docker run starts a single container, whereas docker compose up simplifies multi-container setup as it starts multiple containers defined in a docker-compose.yml file, automatically configuring networks, dependencies, and settings for all services together.

How does Docker Compose help when working with multiple services?

  Docker Compose lets you define multiple services (e.g., web app, database, cache) in one configuration file. It simplifies setup by starting, stopping, and managing all containers together with a single command while automatically handling networking and dependencies.

What commands can you use to check logs from a running container?

  We can use docker logs to check logs or we can use docker logs -f to check logs real-time

What happens when you restart a container? Does data persist?

  Restarting a container keeps its current filesystem state, so data inside the container remains. However, if the container is removed, the data is lost unless it is stored in Docker volumes or external storage, which persist independently of the container.
