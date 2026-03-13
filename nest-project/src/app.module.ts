import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books.module';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm'; 

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER ?? 'myuser',
      password: process.env.DB_PASSWORD ?? 'mysecretpassword',
      database: process.env.DB_NAME ?? 'mydb',
      autoLoadEntities: true,
      synchronize: true,    }),
    BooksModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

