import { Controller, Get, Post, Body } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll(): string[] {
    return this.booksService.findAll();
  }

  @Post()
  create(@Body('title') title: string): string {
    return this.booksService.create(title);
  }
}