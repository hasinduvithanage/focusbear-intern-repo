How does @nestjs/typeorm simplify database interactions?

It plugs TypeORM into NestJS's dependency system. I can register all entitities in a module, and NestJS auto creates repositories that is able to be injected into any service using @InjectoRepository().

What is the difference between an entity and a repository in TypeORM?

Entity - Defines the shape of a database table, like what columns should exist, their types and constraints.
Repository - This provides the methods to read and write data in that table, like save, find, update, delete. It is more like the tool to interact with entity.

How does TypeORM handle migrations in a NestJS project?

It auto creates a file that contains the SQL needed to update a database, for example if I add a new column to the database, I can run a command where TypeORM compares new database vs old one and write an SQL file, which I can check and run so that the database get updated. 
It's a safe and trackable way to change the database structure.

What are the advantages of using PostgreSQL over other databases in a NestJS app?

PostgresSQL supports complex relational queries, full text search, JSON columns and UUID. It scales reliably and since it is the most used service for NestJS backends there are more community resources and better support.
