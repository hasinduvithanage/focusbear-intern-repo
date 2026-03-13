import { Injectable } from '@nestjs/common';

@Injectable()
export class BooksService {
  private books = ['The Hobbit', 'Dune', '1984'];

  findAll(): string[] {
    return this.books;
  }

  create(book: string): string {
    this.books.push(book);
    return `Added: ${book}`;
  }
}