What is the purpose of pipes in NestJS?

Pipes are located in between incoming requests and the route handler. They validate and transform the data, so they reject bad data and converts data to the right data type.

How does ValidationPipe improve API security and data integrity?

It makes sure that only the correctly shaped data reaches the business logic.It prevents unexpected fields so that attackers can't inject harmful properties. Invalid types, missing required fields, and out-of-range values all get caught, so it imporves data integrity.

What is the difference between built-in and custom pipes?

Built in pipes come with NestJS and handle common tasks like validation using DTO and type conversion. Custom pipes can cover logic that built in pipes do not cover, like trimming whitespaces from all strings for exmple.

How do decorators like @IsString() and @IsNumber() work with DTOs?

They add a rule to the propert below it.
@IsString() - property must be a string.
@IsNumber() - propert must be a number.
