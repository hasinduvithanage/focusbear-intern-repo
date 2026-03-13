PostgreSQL is a powerful open source relational database management system that uses SQL. 

What are the benefits of running PostgreSQL in a Docker container?

  Running PostgreSQL in Docker provides a consistent and portable environment across different machines. It avoids installing PostgreSQL directly on the host system, simplifies setup, and isolates the database from other software. This makes development, testing, and deployment easier and ensures all developers use the same configuration.

How do Docker volumes help persist PostgreSQL data?

  Docker volume stores data outside the container's file system. If the container is stopped, the data persists in the volume. When the container is started again, it will regain the data from the volume.

How can you connect to a running PostgreSQL cont

  using the command docker compose exec postgres psql -U hasindu -d my_project_db
  
  where hasindu is the username and my_project_db is the database name.
  
