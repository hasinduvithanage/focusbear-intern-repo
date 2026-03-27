// ---------------------------------------------------------------
// CREATE TASK DTO
//
// Same as your 7.1 project's DTO. class-validator decorators
// define the validation rules. The global ValidationPipe runs
// these checks before the request reaches the controller.
//
// In Supertest tests, we verify that:
//   - Valid data passes and reaches the controller
//   - Invalid data is rejected with 400 status
//   - Unknown fields are stripped (whitelist) or rejected (forbidNonWhitelisted)
// ---------------------------------------------------------------

import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  title!: string;

  @IsString()
  @MinLength(1, { message: 'Description must not be empty' })
  description!: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
