import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Comma-separated allow-list in production; any origin in local dev.
  app.enableCors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : true,
  });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`Vietnamtour API listening on http://localhost:${port}/api`);
}
void bootstrap();
