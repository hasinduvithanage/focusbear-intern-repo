import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This one line validates EVERY route in the app against its DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // strips fields not in the DTO
      forbidNonWhitelisted: true, // errors if extra fields are sent
      transform: true,            // auto-converts types
    }),
  );

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();