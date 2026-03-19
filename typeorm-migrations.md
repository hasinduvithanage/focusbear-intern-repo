What is the purpose of database migrations in TypeORM?

The purpose of database migration is to safely apply database schema changes over time, such as creating tables, adding columns, or updating relationships.

How do migrations differ from seeding?

Migrations change the structure of the database, whereas seeding adds intitial or sample data into the database.

Why is it important to version-control database schema changes?

This makes sure that deployments are safe and allows developers to trace, audit and roll back changes if something breaks. 

How can you roll back a migration if an issue occurs?

We can revert the most recent migration using the TypeORM rollback command, typeorm migration:revert.
