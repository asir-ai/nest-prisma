import 'dotenv/config';
import 'temporal-polyfill/full/global';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body parsing for Stripe webhook verification
  });
  app.enableCors({
    origin: [process.env.FRONTEND_URL], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  await app.listen(3000, '0.0.0.0');
}
await bootstrap();
