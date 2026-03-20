Why does Focus Bear double encrypt sensitive data instead of relying on database encryption alone?

If someone gets database credentials, someone will be able to see everything in plain text. Field-level encryption means even if hackers get in, sensitive columns will be scrambled without a seperate key.

How does typeorm-encrypted integrate with TypeORM entities?

By adding a transformer to a @column() in an entity. When TypeORM saves a record, transformer will encrypt it before writing it. When TypeORM reads a record, it decrypts it automatically.

What are the best practices for securely managing encryption keys?

Keep the .env in the local repo. Do not commit this file to git.
Use a different key for each environment.

What are the trade-offs between encrypting at the database level vs. the application level?

Encrypting at the database level is easier however it does not help if someone get the database password. Application level protects data from even someone inside the database. However you have to manage the encryption key by yourself. The best approach is using both levels of encryption.
