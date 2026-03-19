import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional() // field can be missing entirely
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsBoolean() // must be true or false, not "true" or 1
  completed?: boolean;
}