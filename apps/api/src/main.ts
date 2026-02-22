import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { configSwagger } from './config/docs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/api/v1');
  configSwagger(app);
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
