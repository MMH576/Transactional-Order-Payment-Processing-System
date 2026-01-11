import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Transform payloads to DTO instances
    }),
  );

  // CORS configuration
  const frontendUrl = configService.get('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ? [frontendUrl, 'http://localhost:3000'] : true,
    credentials: true,
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap();
