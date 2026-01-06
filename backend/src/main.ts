import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for future Stripe webhook signature verification
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3001;

  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
}

bootstrap();
