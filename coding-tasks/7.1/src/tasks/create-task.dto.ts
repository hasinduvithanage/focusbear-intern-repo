import { IsString, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MinLength(1) // title cannot be empty
  title: string;

  @IsString()
  @MinLength(1) // description cannot be empty
  description: string;
}