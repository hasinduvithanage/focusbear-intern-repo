How can you check logs from a running container?

docker logs -f <service> lets you get the logs from a running container

What is the difference between docker exec and docker attach?

docker exec opens a new shell inside the container: safe; Ctrl+C just exits the shell.
docker attach connects to the main process: this is risky and Ctrl+C stops the whole container.


How do you restart a container without losing data?

docker restart postgres_db
This is safe since the data is in the volume (pgdata) and not inside the container.

How can you troubleshoot database connection issues inside a containerized NestJS app?

Check if the container is running using docker ps, then check the logs for errors using docker logs. Test the connection using docker exec. Verify the .env values, and see if it matches with the docker-compose.yml file.
Use docker inspect to check the health status.

