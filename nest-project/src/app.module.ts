import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { FocusSessionModule } from './focus-session/focus-session.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'db.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    BooksModule, ProductsModule, FocusSessionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

